import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import FeedList from "./FeedList";

const HomePage = () => {
  const router = useRouter();

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Home Page</Text>

        {/* Profile Picture */}
        <TouchableOpacity
          onPress={() => router.push("./profile")}
          style={styles.profilePicContainer}
        >
          <Image
            source={{ uri: "https://example.com/profile-pic.jpg" }} // Replace with actual URL or local image
            style={styles.profilePic}
          />
        </TouchableOpacity>
      </View>

      {/* Feed */}
      <FeedList />

      {/* Floating Upload Button */}
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => router.push("./uploads")}
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
