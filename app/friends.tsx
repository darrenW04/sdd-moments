import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation
import { SafeAreaView } from "react-native-safe-area-context";

const FriendsPage = () => {
  const navigation = useNavigation(); // Hook for navigation

  // Example friends list
  const [friends, setFriends] = useState([
    {
      id: "1",
      name: "Alice",
      avatar: "https://via.placeholder.com/100",
      bio: "Loves adventures 🌍",
    },
    {
      id: "2",
      name: "Bob",
      avatar: "https://via.placeholder.com/100",
      bio: "Coder and cat lover 🐱",
    },
    {
      id: "3",
      name: "Charlie",
      avatar: "https://via.placeholder.com/100",
      bio: "Sports enthusiast 🏀",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  // Filter friends based on the search query
  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to view friend's profile
  const viewProfile = (friend) => {
    // Navigate to Profile Page with friend data
    navigation.navigate("Profile", { friend });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} />
      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search friends..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Friends List */}
      <FlatList
        data={filteredFriends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.friendItem}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <Text style={styles.friendName}>{item.name}</Text>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => viewProfile(item)}
            >
              <Text style={styles.profileButtonText}>View Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingLeft: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  friendName: {
    fontSize: 18,
    flex: 1,
  },
  profileButton: {
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  profileButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default FriendsPage;
