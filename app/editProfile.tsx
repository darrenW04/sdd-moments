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

const EditProfile = () => {
  const router = useRouter();

  const [profile, setProfile] = useState({
    avatar: "",
    name: "",
    bio: "",
    email: "",
    location: "",
  });

  useEffect(() => {
    // Load profile data from AsyncStorage
    const loadProfile = async () => {
      const storedProfile = await AsyncStorage.getItem("@profile_data");
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    // Save updated profile data to AsyncStorage
    try {
      await AsyncStorage.setItem("@profile_data", JSON.stringify(profile));
      Alert.alert(
        "Profile Updated",
        "Your profile has been updated successfully."
      );
      router.push("/profile"); // Navigate back to Profile page
    } catch (error) {
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

      {/* Bio */}
      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Enter a short bio"
        value={profile.bio}
        multiline
        numberOfLines={4}
        onChangeText={(text) => setProfile({ ...profile, bio: text })}
      />

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={profile.email}
        onChangeText={(text) => setProfile({ ...profile, email: text })}
      />

      {/* Location */}
      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your location"
        value={profile.location}
        onChangeText={(text) => setProfile({ ...profile, location: text })}
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
  textArea: {
    height: 80,
    textAlignVertical: "top", // Ensures text starts from the top in multiline input
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
