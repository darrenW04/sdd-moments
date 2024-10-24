import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const UploadsPage = () => {
  const handleUpload = () => {
    // Placeholder for upload functionality
    alert('Upload functionality coming soon!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Uploads Page</Text>

      <TouchableOpacity style={styles.button} onPress={handleUpload}>
        <Text style={styles.buttonText}>Upload a File</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default UploadsPage;
