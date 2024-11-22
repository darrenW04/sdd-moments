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
import AsyncStorage from "@react-native-async-storage/async-storage"; // Ensure this is imported
import axios from "axios";

const SignupPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleSignup = async () => {
    setErrors({ email: "", username: "", password: "", confirmPassword: "" });

    let valid = true;
    const newErrors: any = {};

    if (!email) {
      newErrors.email = "Email is required";
      valid = false;
    }
    if (!username) {
      newErrors.username = "Username is required";
      valid = false;
    }
    if (!password) {
      newErrors.password = "Password is required";
      valid = false;
    }
    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);

    if (valid) {
      try {
        const response = await axios.post(
          `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/signup`,
          {
            email,
            username,
            profile_picture: profilePicture,
            password,
          }
        );

        const { userId } = response.data;

        // Store the user_id in AsyncStorage
        await AsyncStorage.setItem("currentUserId", userId);

        console.log("Signup response:", response.data);
        Alert.alert("Signup Successful", `Welcome ${username}!`);
        router.replace("./profile"); // Redirect to the profile page
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

      {/* Email */}
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
      {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

      {/* Username */}
      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#888888"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      {errors.username ? (
        <Text style={styles.errorText}>{errors.username}</Text>
      ) : null}

      {/* Profile Picture */}
      <Text style={styles.label}>Profile Picture URL</Text>
      <TextInput
        style={styles.input}
        placeholder="Profile Picture URL (optional)"
        placeholderTextColor="#888888"
        value={profilePicture}
        onChangeText={setProfilePicture}
        autoCapitalize="none"
      />

      {/* Password */}
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
      {errors.password ? (
        <Text style={styles.errorText}>{errors.password}</Text>
      ) : null}

      {/* Confirm Password */}
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
      {errors.confirmPassword ? (
        <Text style={styles.errorText}>{errors.confirmPassword}</Text>
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
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#BB86FC",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "bold",
    color: "#ffffff",
  },
  input: {
    height: 50,
    borderColor: "#333333",
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#ffffff",
    backgroundColor: "#1e1e1e",
  },
  errorText: {
    color: "#cf6679",
    fontSize: 14,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#03DAC6",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: "#121212",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default SignupPage;
