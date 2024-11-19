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
import { FontAwesome } from "@expo/vector-icons";
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
      const response = await axios.put(
        `http://192.168.6.61:3000/api/users/${currentUserId}`,
        profile
      );
      Alert.alert("Profile Updated", response.data.message);
      router.push("/profile");
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
        placeholderTextColor="#bbb"
        value={profile.avatar}
        onChangeText={(text) => setProfile({ ...profile, avatar: text })}
      />

      {/* Name */}
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        placeholderTextColor="#bbb"
        value={profile.name}
        onChangeText={(text) => setProfile({ ...profile, name: text })}
      />

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#bbb"
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
    backgroundColor: "#121212", // Dark background
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#1A1A1A",
    color: "#FFFFFF", // Input text color
  },
  saveButton: {
    backgroundColor: "#1E90FF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EditProfile;
