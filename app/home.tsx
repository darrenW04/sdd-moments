import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import FeedView from "./feed";
import { SafeAreaView } from "react-native-safe-area-context";

const HomePage = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <SafeAreaView />
      <Text style={styles.title}>Home Page</Text>

      {/* Feed */}
      <FeedView />
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("./profile")}
      >
        <Text style={styles.buttonText}>Go to Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("./uploads")}
      >
        <Text style={styles.buttonText}>Go to Uploads Page</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
});

export default HomePage;
