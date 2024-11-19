import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

type Friend = {
  userId: string;
  name: string;
  avatar: string;
  status: string;
};

const FriendsPage = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFriendsDetails = async () => {
      try {
        const currentUserId = await AsyncStorage.getItem("currentUserId");
        if (!currentUserId) {
          console.error("Current user ID not found");
          return;
        }

        const response = await axios.get(
          `http://192.168.6.61:3000/api/users/${currentUserId}/friends-details`
        );

        if (response.data) {
          setFriends(response.data.friends);
        }
      } catch (error) {
        console.error("Error fetching friends details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriendsDetails();
  }, []);

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} />

      {/* Back Button */}
      <TouchableOpacity onPress={() => router.push("/profile")} style={styles.backButton}>
        <FontAwesome name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Add Friends Button */}
      <TouchableOpacity
        style={styles.addFriendsButton}
        onPress={() => router.push("/addFriends")}
      >
        <Text style={styles.buttonText}>Add Friends</Text>
      </TouchableOpacity>

      {/* Remove Friends Button */}
      <TouchableOpacity
        style={styles.removeFriendsButton}
        onPress={() => router.push("/removeFriends")}
      >
        <Text style={styles.buttonText}>Remove Friends</Text>
      </TouchableOpacity>

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
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <View style={styles.friendItem}>
            <Image
              source={{
                uri: item.avatar || "https://via.placeholder.com/100",
              }}
              style={styles.avatar}
            />
            <View style={styles.friendDetails}>
              <Text style={styles.friendName}>{item.name}</Text>
              <Text style={styles.friendStatus}>{`Status: ${item.status}`}</Text>
            </View>
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
    top: 65,
    left: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  addFriendsButton: {
    position: "absolute",
    top: 70,
    right: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    zIndex: 1,
  },
  removeFriendsButton: {
    position: "absolute",
    top: 70,
    right: 130,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#ff4d4d",
    zIndex: 1,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingLeft: 10,
    borderRadius: 5,
    marginBottom: 20,
    marginTop: 70, // Prevent overlap with buttons
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  friendDetails: {
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  friendName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  friendStatus: {
    fontSize: 14,
    color: "#666",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default FriendsPage;
