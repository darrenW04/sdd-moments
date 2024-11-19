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
          `http://192.168.6.61:3000/api/users/${currentUserId}`
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
        <ActivityIndicator size="large" color="#007bff" />
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
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <FontAwesome name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Centered Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={{
            uri: userProfile.profile_picture || "https://via.placeholder.com/150",
          }}
          style={styles.avatar}
        />

        <View style={styles.infoContainer}>
          <Text style={styles.username}>{userProfile.username}</Text>
          <Text style={styles.email}>{`Email: ${userProfile.email}`}</Text>
          <Text style={styles.info}>{`Friends: ${userProfile.friend_count}`}</Text>
          <Text style={styles.info}>
            {`Account Created: ${new Date(userProfile.created_at).toLocaleString()}`}
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push("/editProfile")}
          >
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.friendButton}
            onPress={() => router.push("/friends")}
          >
            <Text style={styles.buttonText}>Friends</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
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
    backgroundColor: "#007bff",
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
    borderColor: "#007bff",
  },
  infoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  username: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
  },
  email: {
    fontSize: 18,
    color: "#333",
    marginBottom: 15,
  },
  info: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 20, // Add spacing between button container and logout button
  },
  editButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  friendButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "80%", // Ensure the logout button is aligned with other buttons
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
});

export default ProfilePage;
