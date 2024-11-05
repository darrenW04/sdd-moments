import React, { useState } from "react";
import LoginPage from "./login";
import SignupPage from "./signup";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function Index() {
  const [isLogin, setIsLogin] = useState(true); // State to toggle between login and signup

  const togglePage = () => {
    setIsLogin(!isLogin); // Toggle between login and signup
  };

  return (
    <View style={styles.container}>
      {isLogin ? <LoginPage /> : <SignupPage />}

      <TouchableOpacity onPress={togglePage} style={styles.toggleButton}>
        <Text style={styles.toggleText}>
          {isLogin
            ? "Don't have an account? Sign Up"
            : "Already have an account? Sign In"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#ffffff",
  },
  toggleButton: {
    marginTop: 20,
    alignItems: "center",
  },
  toggleText: {
    fontSize: 16,
    color: "#007BFF",
    textDecorationLine: "underline",
  },
});
