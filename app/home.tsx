import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import FeedList from "./FeedList";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
type UserProfile = {
  username: string;
  email: string;
  profile_picture: string;
  created_at: string;
  friend_count: number;
};
const HomePage = () => {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const currentUserId = await AsyncStorage.getItem("currentUserId");
        if (!currentUserId) {
          console.error("Current user ID not found");
          return;
        }

        const [profileResponse] = await Promise.all([
          axios.get(
            `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/users/${currentUserId}`
          ),
        ]);

        if (profileResponse.data) {
          setUserProfile(profileResponse.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchUserProfile();
  }, []);
  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Home Page</Text>

        {/* Profile Picture */}
        <TouchableOpacity
          onPress={() => router.replace("./profile")}
          style={styles.profilePicContainer}
        >
          <Image
            source={{
              uri:
                userProfile?.profile_picture ||
                "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/User_icon_2.svg/480px-User_icon_2.svg.png",
            }} // Replace with actual URL or local image
            style={styles.profilePic}
          />
        </TouchableOpacity>
      </View>

      {/* Feed */}
      <FeedList />

      {/* Floating Upload Button */}
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => router.replace("./uploads")}
      >
        <Text style={styles.uploadButtonText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212", // Dark background
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333", // Divider for dark mode
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF", // White text for contrast
  },
  profilePicContainer: {
    borderRadius: 20,
    overflow: "hidden",
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#666", // Gray for placeholder
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  uploadButton: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "#1E88E5", // Bright blue for visibility
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  uploadButtonText: {
    color: "#FFFFFF", // White text for button
    fontSize: 30,
    fontWeight: "bold",
  },
});

export default HomePage;
