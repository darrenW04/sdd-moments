import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FriendsPage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Friends Page</Text>
      <Text>Here, you can see and manage your friends.</Text>
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
});

export default FriendsPage;
