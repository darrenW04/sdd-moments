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
          console.error("Current user ID not found");
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
          const filteredVideos = videoResponse.data.filter(
            (video: any) => video.userId === currentUserId
          );
          setVideos(filteredVideos);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

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
      {/* Fixed Back Button */}
      <TouchableOpacity
        onPress={() => router.replace("/home")}
        style={styles.backButton}
      >
        <FontAwesome name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Centered Profile Section */}
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

          {/* Buttons */}
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

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        {/* Display Videos */}
        <Text style={styles.sectionHeader}>My Videos</Text>
        <FlatList
          data={videos}
          keyExtractor={(item) => item.videoId}
          renderItem={({ item }) => (
            <View style={styles.videoCard}>
              <Text style={styles.videoTitle}>{item.title}</Text>
              <Text style={styles.videoDescription}>{item.description}</Text>
              <Text>{`Views: ${item.viewCount}`}</Text>
              {/* <TouchableOpacity
                // onPress={() => router.push(item.videoUrl)}
                style={styles.videoLink}
              >
                <Text style={styles.linkText}>Watch Video</Text>
              </TouchableOpacity> */}
              {/* Video */}
              <View style={styles.videoContainer}>
                <WebView
                  source={{
                    uri: item.videoUrl,
                  }}
                  style={styles.webview}
                  allowsFullscreenVideo
                  allowsInlineMediaPlayback
                  mediaPlaybackRequiresUserAction={false}
                />
              </View>
            </View>
          )}
          scrollEnabled={false} // Disable FlatList's internal scrolling
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
});

export default ProfilePage;
