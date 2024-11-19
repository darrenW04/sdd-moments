import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons"; // For the back icon
import axios from "axios";

const EditProfile = () => {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    avatar: "",
    name: "",
    email: "",
  });

  useEffect(() => {
    // Load profile data from the server
    const loadProfile = async () => {
      try {
        const userId = await AsyncStorage.getItem("currentUserId");
        if (!userId) {
          console.error("Current user ID not found");
          return;
        }
        setCurrentUserId(userId);

        const response = await axios.get(
          `http://192.168.6.61:3000/api/users/${userId}`
        );
        const { profile_picture, username, email } = response.data;
        setProfile({
          avatar: profile_picture,
          name: username,
          email: email,
        });
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!currentUserId) {
      Alert.alert("Error", "User ID not found");
      return;
    }

    try {
      // Send updated profile data to the server
      const response = await axios.put(
        `http://192.168.6.61:3000/api/users/${currentUserId}`,
        profile
      );
      Alert.alert("Profile Updated", response.data.message);
      router.push("/profile"); // Navigate back to Profile page
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "There was an error saving your profile.");
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} />
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <FontAwesome name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>Edit Profile</Text>

      {/* Avatar URL */}
      <Text style={styles.label}>Avatar URL</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter avatar URL"
        value={profile.avatar}
        onChangeText={(text) => setProfile({ ...profile, avatar: text })}
      />

      {/* Name */}
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={profile.name}
        onChangeText={(text) => setProfile({ ...profile, name: text })}
      />

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={profile.email}
        onChangeText={(text) => setProfile({ ...profile, email: text })}
      />

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  saveButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EditProfile;
