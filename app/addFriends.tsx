import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import axios from "axios";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  userId: string;
  username: string;
};

const AddFriendsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const searchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://192.168.6.61:3000/api/users/search`, {
        params: { query: searchQuery },
      });
      setResults(response.data); // Ensure your API returns an array of users
    } catch (error) {
      console.error("Error searching users:", error);
      Alert.alert("Error", "Unable to search for users.");
    } finally {
      setLoading(false);
    }
  };

  const addFriend = async (friendId: string) => {
    try {
      const currentUserId = await AsyncStorage.getItem("currentUserId");
      if (!currentUserId) {
        Alert.alert("Error", "No user ID found.");
        return;
      }

      await axios.post(`http://192.168.6.61:3000/api/users/${currentUserId}/addFriend`, {
        friendId,
      });

      Alert.alert("Success", "Friend request sent!");
    } catch (error) {
      console.error("Error adding friend:", error);
      Alert.alert("Error", "Unable to send friend request.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.push("/friends")} style={styles.backButton}>
        <FontAwesome name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Search for a friend..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <TouchableOpacity style={styles.searchButton} onPress={searchUsers} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Searching..." : "Search"}</Text>
      </TouchableOpacity>
      <FlatList
        data={results}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text style={styles.username}>{item.username}</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => addFriend(item.userId)}>
              <Text style={styles.addButtonText}>Add Friend</Text>
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
  backButton: {
    position: "absolute",
    top: 75,
    left: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  input: {
    height: 40,
    top: 125,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  searchButton: {
    top: 127,
    backgroundColor: "#007bff",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  userItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginBottom: 10,
  },
  username: {
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: "#fff",
  },
});

export default AddFriendsPage;
