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

const SignupPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const handleSignup = async () => {
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    let valid = true;
    if (!email) {
      setEmailError("Email is required");
      valid = false;
    }
    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    }
    if (password && confirmPassword && password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      valid = false;
    }

    if (valid) {
      try {
        const response = await axios.post(
          `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/signup`,
          {
            email,
            password,
          }
        );
        console.log("Signup response:", response.data);
        Alert.alert("Signup Successful", `Welcome ${email}!`);
        router.replace("./home");
      } catch (err: any) {
        console.error("Signup error:", err);
        if (axios.isAxiosError(err) && err.response) {
          const errorMessage =
            err.response.data?.message || "An unexpected error occurred";
          Alert.alert("Signup Failed", errorMessage);
        } else {
          Alert.alert("Signup Failed", "Network Error");
        }
      }
    } else {
      Alert.alert("Signup Failed", "Please fill in all required fields");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Signup</Text>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888888"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
      />
      {passwordError ? (
        <Text style={styles.errorText}>{passwordError}</Text>
      ) : null}

      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#888888"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        autoCapitalize="none"
      />
      {confirmPasswordError ? (
        <Text style={styles.errorText}>{confirmPasswordError}</Text>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
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
    color: "#BB86FC", // Light purple color for title
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "bold",
    color: "#ffffff", // White color for labels
  },
  input: {
    height: 50,
    borderColor: "#333333", // Dark border color for inputs
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#ffffff", // White text color in inputs
    backgroundColor: "#1e1e1e", // Slightly lighter background for inputs
  },
  errorText: {
    color: "#cf6679", // Red-ish color for error text in dark mode
    fontSize: 14,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#03DAC6", // Teal accent color for button
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: "#121212", // Dark color for button text for contrast
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default SignupPage;
