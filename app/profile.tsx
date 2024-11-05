import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

const ProfilePage = () => {
  const router = useRouter();
  const { friend } = useLocalSearchParams();

  // Set default profile values if no profile data is passed in
  const [profile, setProfile] = useState({
    avatar: "https://via.placeholder.com/150",
    name: "John Doe",
    bio: "This is a sample bio. Update your profile to add more information about yourself.",
    email: "example@example.com",
    location: "Unknown",
    friendsCount: 0, // Default friends count
    ...friend, // Overrides defaults if `friend` data is provided
  });

  useEffect(() => {
    if (friend) {
      setProfile({ ...profile, ...friend });
    }
  }, [friend]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Profile Image */}
        <Image source={{ uri: profile.avatar }} style={styles.avatar} />

        {/* User Name and Bio */}
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.bio}>{profile.bio}</Text>

        {/* Additional Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Email:</Text>
          <Text style={styles.infoText}>{profile.email}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Location:</Text>
          <Text style={styles.infoText}>{profile.location}</Text>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push("/editProfile")}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Friends Button with Counter */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.friendButton}
            onPress={() => router.push("/friends")}
          >
            <Text style={styles.friendButtonText}>Friends</Text>
            {profile.friendsCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{profile.friendsCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/settings")}
          >
            <Text style={styles.actionButtonText}>Settings</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: "#f8f9fa",
  },
  container: {
    alignItems: "center",
    padding: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#cccccc",
    marginBottom: 20,
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  bio: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
  },
  infoText: {
    fontSize: 16,
    color: "#777",
  },
  editButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 40,
    backgroundColor: "#007bff",
    borderRadius: 8,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  actionsContainer: {
    flexDirection: "row",
    marginTop: 30,
    justifyContent: "space-around",
    width: "100%",
  },
  friendButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: "#6c757d",
    borderRadius: 8,
    position: "relative",
  },
  friendButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FF6347",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: "#6c757d",
    borderRadius: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  message: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  createButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfilePage;
