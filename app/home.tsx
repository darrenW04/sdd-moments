import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import FeedList from "./FeedList";
import FriendsAndMyVideos from "./FriendsAndMyVideos"; // Component to show friends' and user's videos
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

type UserProfile = {
  username: string;
  email: string;
  profile_picture: string;
  created_at: string;
  friend_count: number;
  friends: any[];
};

const HomePage = () => {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isFeedView, setIsFeedView] = useState(true); // Toggle state for switching views
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
          // Transform friends array to only include user IDs
          const transformedFriends = profileResponse.data.friends.map(
            (friend: any) => friend.friend_user_id
          );

          // Set the transformed friends back into the user profile
          setUserProfile({
            ...profileResponse.data,
            friends: transformedFriends, // Replace friends with just user IDs
          });
        }

        console.log("Transformed Profile Data:", profileResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isFeedView ? "Feed" : "Friends & My Videos"}
        </Text>

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
            }}
            style={styles.profilePic}
          />
        </TouchableOpacity>
      </View>

      {/* Toggle Buttons */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            isFeedView ? styles.activeButton : styles.inactiveButton,
          ]}
          onPress={() => setIsFeedView(true)}
        >
          <Text style={styles.toggleText}>Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            !isFeedView ? styles.activeButton : styles.inactiveButton,
          ]}
          onPress={() => setIsFeedView(false)}
        >
          <Text style={styles.toggleText}>Friends & My Videos</Text>
        </TouchableOpacity>
      </View>

      {/* Conditional Rendering */}
      {isFeedView ? (
        <FeedList />
      ) : (
        <FriendsAndMyVideos userIds={userProfile?.friends || []} />
      )}

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
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  profilePicContainer: {
    borderRadius: 20,
    overflow: "hidden",
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#666",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#1E90FF",
  },
  inactiveButton: {
    backgroundColor: "#333",
  },
  toggleText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  uploadButton: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "#1E88E5",
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
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "bold",
  },
});

export default HomePage;
