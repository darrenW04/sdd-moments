import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; // Corrected: useLocalSearchParams

const ProfilePage = () => {
  const router = useRouter();
  const { friend } = useLocalSearchParams(); // Corrected: Use useLocalSearchParams to get the passed parameters
  const [profile, setProfile] = useState(friend || null); // Initialize profile state with passed friend data

  useEffect(() => {
    if (friend) {
      setProfile(friend); // Update profile state when params change
    }
  }, [friend]);

  // Handle case when friend data is not provided
  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No profile data available.</Text>
        {/* Create Profile Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/createProfile')} // Navigate to the CreateProfile screen
        >
          <Text style={styles.createButtonText}>Create Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <Image source={{ uri: profile.avatar }} style={styles.avatar} />

      {/* Name */}
      <Text style={styles.name}>{profile.name}</Text>

      {/* Bio */}
      <Text style={styles.bio}>{profile.bio}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bio: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  createButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ProfilePage;
