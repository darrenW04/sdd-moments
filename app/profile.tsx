import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import WebView from "react-native-webview";

type UserProfile = {
  username: string;
  email: string;
  profile_picture: string;
  created_at: string;
  friend_count: number;
};

type Video = {
  videoId: string;
  title: string;
  description: string;
  videoUrl: string;
  isPublic: boolean;
  uploadTime: string;
  viewCount: number;
};

const screenWidth = Dimensions.get("window").width;

const ProfilePage = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const currentUserId = await AsyncStorage.getItem("currentUserId");
        if (!currentUserId) {
          console.error("Current user ID not found, redirecting to login.");
          Alert.alert("Error", "User not logged in. Redirecting to login...");
          router.replace("/login");
          return;
        }

        const [profileResponse, videoResponse] = await Promise.all([
          axios.get(
            `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/users/${currentUserId}`
          ),
          axios.get(
            `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/videos`
          ),
        ]);

        if (profileResponse.data) {
          setUserProfile(profileResponse.data);
        }

        if (videoResponse.data) {
          // Filter videos for the current user
          const filteredVideos = videoResponse.data.filter(
            (video: any) => video.userId === currentUserId
          );

          // Sort videos by uploadTime in descending order (most recent first)
          const sortedVideos = filteredVideos.sort(
            (a: any, b: any) =>
              new Date(b.uploadTime).getTime() -
              new Date(a.uploadTime).getTime()
          );

          setVideos(sortedVideos);
        }
      } catch (error) {
        Alert.alert(
          "Error",
          "An error occurred while loading your profile. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleDeleteVideo = async (videoId: string) => {
    try {
      const confirmDelete = await new Promise((resolve) => {
        Alert.alert(
          "Delete Video",
          "Are you sure you want to delete this video?",
          [
            { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => resolve(true),
            },
          ]
        );
      });

      if (!confirmDelete) return;

      await axios.delete(
        `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/videos/${videoId}/toggleVisibility`
      );

      setVideos((prevVideos) =>
        prevVideos.filter((video) => video.videoId !== videoId)
      );

      Alert.alert("Success", "Video deleted successfully.");
    } catch (error) {
      console.error("Error deleting video:", error);
      Alert.alert("Error", "An error occurred while deleting the video.");
    }
  };

  // Function to toggle video visibility
  const toggleVideoVisibility = async (videoId: string) => {
    try {
      const response = await axios.put(
        `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/videos/${videoId}/toggleVisibility`
      );

      // Check the response to ensure it's correctly toggled
      const updatedVisibility = response.data.isPublic;

      // Update the video visibility in the state
      setVideos((prevVideos) =>
        prevVideos.map((video) =>
          video.videoId === videoId
            ? { ...video, isPublic: !video.isPublic } // Update with the new visibility state
            : video
        )
      );

      // Alert message based on the updated visibility status
      Alert.alert("Success video updated");
    } catch (error) {
      console.error("Error toggling video visibility:", error);
      Alert.alert("Error", "An error occurred while updating visibility.");
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("currentUserId");
      router.replace("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error loading profile.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} />
      <TouchableOpacity
        onPress={() => router.replace("/home")}
        style={styles.backButton}
      >
        <FontAwesome name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <Image
            source={{
              uri:
                userProfile.profile_picture ||
                "https://via.placeholder.com/150",
            }}
            style={styles.avatar}
          />
          <View style={styles.infoContainer}>
            <Text style={styles.username}>{userProfile.username}</Text>
            <Text style={styles.email}>{`Email: ${userProfile.email}`}</Text>
            <Text style={styles.info}>
              {`Friends: ${userProfile.friend_count}`}
            </Text>
            <Text style={styles.info}>
              {`Account Created: ${new Date(
                userProfile.created_at
              ).toLocaleString()}`}
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.replace("/editProfile")}
            >
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.friendButton}
              onPress={() => router.replace("/friends")}
            >
              <Text style={styles.buttonText}>Friends</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionHeader}>My Videos</Text>
        <FlatList
          data={videos}
          keyExtractor={(item) => item.videoId}
          renderItem={({ item }) => (
            <View style={styles.videoCard}>
              <Text style={styles.videoTitle}>{item.title}</Text>
              <Text
                style={{ color: "white" }}
              >{`Views: ${item.viewCount}`}</Text>
              <Text style={styles.videoDescription}>
                Description: {item.description}
              </Text>
              <Text style={styles.videoDescription}>
                Upload Time: {new Date(item.uploadTime).toLocaleString()}
              </Text>
              <View style={styles.videoContainer}>
                <WebView
                  source={{ uri: item.videoUrl }}
                  style={styles.webview}
                  allowsFullscreenVideo
                />
              </View>

              {/* Toggle visibility button */}
              <TouchableOpacity
                style={[
                  styles.toggleVisibilityButton,
                  item.isPublic ? styles.publicButton : styles.privateButton,
                ]}
                onPress={() => toggleVideoVisibility(item.videoId)}
              >
                <Text style={styles.toggleButtonText}>
                  {item.isPublic ? "Set to Private" : "Set to Public"}
                </Text>
              </TouchableOpacity>

              {/* Delete button */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteVideo(item.videoId)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // Dark background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#FF4D4D",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  backButton: {
    position: "absolute",
    top: 65,
    left: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1E90FF",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  scrollContent: {
    paddingBottom: 20, // Add spacing for scrolling
  },
  profileSection: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 80,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#1E90FF",
  },
  infoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  username: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 15,
  },
  email: {
    fontSize: 18,
    color: "#BBBBBB",
    marginBottom: 15,
  },
  info: {
    fontSize: 16,
    color: "#AAAAAA",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  friendButton: {
    backgroundColor: "#1E90FF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#FF4D4D",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 20,
    textAlign: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#FF4D4D",
    textAlign: "center",
    marginTop: 20,
  },
  videoCard: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  videoDescription: {
    fontSize: 14,
    color: "#BBBBBB",
    marginBottom: 10,
  },
  videoLink: {
    backgroundColor: "#1E90FF",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  linkText: {
    color: "#FFFFFF",
    textAlign: "center",
  },
  videoContainer: {
    width: "100%",
    height: (screenWidth - 32) * (9 / 16), // Adjust for 16:9 aspect ratio
    marginBottom: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  webview: {
    flex: 1,
  },
  toggleVisibilityButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  publicButton: {
    backgroundColor: "#4CAF50",
  },
  privateButton: {
    backgroundColor: "#FF6347",
  },
  toggleButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

export default ProfilePage;
