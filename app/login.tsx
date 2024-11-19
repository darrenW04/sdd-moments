import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleLogin = async () => {
    setEmailError("");
    setPasswordError("");

    let valid = true;
    if (!email) {
      setEmailError("Email is required");
      valid = false;
    }
    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    }

    if (valid) {
      try {
        console.log("Sending login request with:", { email, password });
        const response = await axios.post(
          `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/login`,
          {
            email,
            password,
          }
        );
        console.log("Response data:", response.data);

        if (response.data && response.data.user_id) {
          await AsyncStorage.setItem(
            "currentUserId",
            response.data.user_id.toString()
          );
          console.log(
            "Current user ID stored in AsyncStorage:",
            response.data.user_id
          );

          Alert.alert("Login Successful", `Welcome ${email}!`);
          router.replace("./home");
        } else {
          console.error("User ID not found in response");
          Alert.alert("Login Failed", "User ID not found in the response");
        }
      } catch (err: any) {
        console.error("Login error:", err);
        if (axios.isAxiosError(err) && err.response) {
          const errorMessage =
            err.response.data?.message || "An unexpected error occurred";
          Alert.alert("Login Failed", errorMessage);
        } else {
          Alert.alert("Login Failed", "Network Error");
        }
      }
    } else {
      Alert.alert("Login Failed", "Please fill in all required fields");
    }
  };

  const handleDev = async () => {
    router.replace("./home");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      {emailError && <Text style={styles.errorText}>{emailError}</Text>}

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
      />
      {passwordError ? (
        <Text style={styles.errorText}>{passwordError}</Text>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleDev}>
        <Text style={styles.buttonText}>Dev</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#121212", // Dark background color
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#ffffff", // Light text color for dark mode
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "bold",
    color: "#ffffff", // Light text color for labels
  },
  input: {
    height: 50,
    borderColor: "#333", // Darker border color for inputs
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#ffffff", // Light text color for input
    backgroundColor: "#222222", // Dark background for input fields
  },
  errorText: {
    color: "#ff5252", // Bright red for errors
    fontSize: 14,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#6200ea", // Purple shade for button in dark mode
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: "#ffffff", // White text on buttons
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default LoginPage;
