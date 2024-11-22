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
  user_id: string;
  username: string;
};

const AddFriendsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      Alert.alert("Error", "Please enter a username to search.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/users/search`,
        {
          params: { username: searchQuery.trim() },
        }
      );

      if (response.data.length === 0) {
        Alert.alert("No Results", "No users found with this username.");
      } else {
        console.log("Search results:", response.data);
        setResults(response.data);
      }
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
  
      console.log("Adding Friend:", { currentUserId, friendId }); // Debugging log
  
      const response = await axios.post(
        `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/users/${currentUserId}/add-friend`,
        {
          friendId, // Ensure this matches the backend field
        }
      );
  
      console.log("Friend added successfully:", response.data);
      Alert.alert("Success", "Friend added successfully!");
    } catch (error) {
      console.error("Error adding friend:", error);
      Alert.alert("Error", "Unable to add friend.");
    }
  };
  

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.replace("/friends")}
        style={styles.backButton}
      >
        <FontAwesome name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Search for a username..."
        placeholderTextColor="#bbb"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <TouchableOpacity
        style={styles.searchButton}
        onPress={searchUsers}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Searching..." : "Search"}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={results}
        keyExtractor={(item) => {
          console.log("KeyExtractor item:", item);
          return item.user_id;
        }}
        renderItem={({ item }) => {
          console.log("RenderItem item:", item);
          return (
            <View style={styles.userItem}>
              <Text style={styles.username}>{item.username}</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => addFriend(item.user_id)}
              >
                <Text style={styles.addButtonText}>Add Friend</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#121212",
  },
  backButton: {
    position: "absolute",
    top: 75,
    left: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1E90FF",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#1A1A1A",
    color: "#fff",
    paddingLeft: 10,
    marginLeft: 50,
    borderRadius: 5,
    marginBottom: 20,
    marginTop: 130,
  },
  searchButton: {
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
    backgroundColor: "#1A1A1A",
    borderRadius: 5,
    marginBottom: 10,
  },
  username: {
    fontSize: 16,
    color: "#fff",
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
