import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import FeedView from './feed';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomePage = () => {
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Home Page</Text>

        {/* Profile Picture */}
        <TouchableOpacity
          onPress={() => router.push('./profile')}
          style={styles.profilePicContainer}
        >
          <Image
            source={{ uri: 'https://example.com/profile-pic.jpg' }} // Replace with actual URL or local image
            style={styles.profilePic}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* Feed */}
        <FeedView />
      </View>

      {/* Floating Upload Button */}
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => router.push('./uploads')}
      >
        <Text style={styles.uploadButtonText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  profilePicContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  uploadButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#007BFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5, // Adds shadow for Android
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
});

export default HomePage;
