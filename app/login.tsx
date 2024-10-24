import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from 'expo-router';


const LoginPage = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogin = () => {
    // Reset error messages
    setEmailError("");
    setPasswordError("");

    // Simple validation
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
      // Simulate login process
      Alert.alert("Login Successful", `Welcome ${email}!`);
      router.push('./home');
    } else {
      Alert.alert("Login Failed", "Please fill in all required fields");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="username"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <Text style={styles.text}>
        Don't have an account? <Text style={styles.link}>Sign Up</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#000',  // Background color based on the design
  },
  title: {
    fontSize: 32,
    color: '#fff',  // White text color
    marginBottom: 24,
  },
  input: {
    width: '80%',
    padding: 10,
    backgroundColor: '#ccc',  // Light input background
    marginBottom: 16,
    borderRadius: 8,
  },
  button: {
    width: '80%',
    padding: 15,
    backgroundColor: '#555',  // Button background
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',  // Button text color
    fontSize: 18,
  },
  text: {
    color: '#fff',
    marginTop: 16,
  },
  link: {
    color: '#00f',  // Link color
    textDecorationLine: 'underline',
  },
});

export default LoginPage;
