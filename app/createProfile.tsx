import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';

const CreateProfile = () => {
  const router = useRouter(); // Use router for navigation
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('https://via.placeholder.com/150'); // Default placeholder avatar

  // Function to handle profile creation
  const handleCreateProfile = () => {
    const newProfile = {
      name,
      bio,
      avatar,
    };

    // Navigate back to the Profile Page with the new profile data
    router.replace({
      pathname: '/profile',
      params: { friend: newProfile }, // Pass the new profile data
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter a bio"
        value={bio}
        onChangeText={setBio}
      />

      <Button title="Create Profile" onPress={handleCreateProfile} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

export default CreateProfile;
