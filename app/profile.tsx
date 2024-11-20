import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";

type UserProfile = {
  username: string;
  email: string;
  profile_picture: string;
  created_at: string;
  friend_count: number;
};

const ProfilePage = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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

        const response = await axios.get(
          `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/users/${currentUserId}`
        );

        if (response.data) {
          setUserProfile(response.data);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);
  const filterVideosByUserId = (videos: any[], userId: string) => {
    return videos.filter((video) => video.userId === userId);
  };

  const fetchedVideos = async () => {
    try {
      const currentUserId = await AsyncStorage.getItem("currentUserId");
      if (!currentUserId) {
        console.error("Current user ID not found");
        return;
      }
      const response = await axios.get(
        `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/videos`
      ); // Ensure this matches your server's IP and port
      console.log("Response data:", response.data);
      // filterVideosByUserId(response.data, currentUserId);
      console.log(
        "Filtered videos:",
        filterVideosByUserId(response.data, currentUserId)
      );
      return filterVideosByUserId(response.data, currentUserId);
    } catch (error) {
      console.error("Error fetching videos:", error);
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
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.replace("/home")}
        style={styles.backButton}
      >
        <FontAwesome name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Centered Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={{
            uri:
              userProfile.profile_picture || "https://via.placeholder.com/150",
          }}
          style={styles.avatar}
        />

        <View style={styles.infoContainer}>
          <Text style={styles.username}>{userProfile.username}</Text>
          <Text style={styles.email}>{`Email: ${userProfile.email}`}</Text>
          <Text
            style={styles.info}
          >{`Friends: ${userProfile.friend_count}`}</Text>
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
        <TouchableOpacity style={styles.logoutButton} onPress={fetchedVideos}>
          <Text style={styles.logoutButtonText}>VIDEOS </Text>
        </TouchableOpacity>
      </View>
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
  profileSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: -50,
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
    color: "#FFFFFF", // White for dark mode
    marginBottom: 15,
  },
  email: {
    fontSize: 18,
    color: "#BBBBBB", // Lighter gray for email text
    marginBottom: 15,
  },
  info: {
    fontSize: 16,
    color: "#AAAAAA", // Gray for other info
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
  errorText: {
    fontSize: 18,
    color: "red",
  },
});

export default ProfilePage;
