import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Friend = {
  userId: string;
  name: string;
};

const RemoveFriendsPage = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true);
      try {
        const currentUserId = await AsyncStorage.getItem("currentUserId");
        if (!currentUserId) {
          console.error("Current user ID not found");
          Alert.alert("Error", "User ID not found in storage.");
          return;
        }

        const response = await axios.get(
          `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/users/${currentUserId}/friends`
        );
        setFriends(response.data);
      } catch (error) {
        console.error("Error fetching friends:", error);
        Alert.alert("Error", "Unable to fetch friends.");
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const removeFriend = async (friendId: string) => {
    try {
      const currentUserId = await AsyncStorage.getItem("currentUserId");
      if (!currentUserId) {
        Alert.alert("Error", "No user ID found.");
        return;
      }

      await axios.post(
        `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/users/${currentUserId}/removeFriend`,
        { friendId }
      );

      setFriends((prevFriends) =>
        prevFriends.filter((friend) => friend.userId !== friendId)
      );
      Alert.alert("Success", "Friend removed successfully!");
    } catch (error) {
      console.error("Error removing friend:", error);
      Alert.alert("Error", "Unable to remove friend.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.push("/friends")}
        style={styles.backButton}
      >
        <FontAwesome name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>

      <FlatList
        data={friends}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <View style={styles.friendItem}>
            <Text style={styles.friendName}>{item.name}</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeFriend(item.userId)}
            >
              <Text style={styles.removeButtonText}>Remove Friend</Text>
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
  friendItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    top: 135,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginBottom: 10,
  },
  friendName: {
    fontSize: 16,
  },
  removeButton: {
    backgroundColor: "#FF4D4D",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  removeButtonText: {
    color: "#fff",
  },
});

export default RemoveFriendsPage;
