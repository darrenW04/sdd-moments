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
    Alert.alert(
      "Confirm Remove Friend",
      "Are you sure you want to remove this friend?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              const currentUserId = await AsyncStorage.getItem("currentUserId");
              if (!currentUserId) {
                Alert.alert("Error", "No user ID found.");
                return;
              }

              console.log("Current User ID:", currentUserId);
              console.log("Friend ID to remove:", friendId);

              const response = await axios.post(
                `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/users/${currentUserId}/remove-friend`,
                { friendId }
              );

              console.log("Remove Friend API Response:", response.data);

              if (response.status === 200) {
                setFriends((prevFriends) =>
                  prevFriends.filter((friend) => friend.userId !== friendId)
                );
                Alert.alert("Success", "Friend removed successfully!");
              } else {
                Alert.alert("Error", response.data.message);
              }
            } catch (error) {
              console.error("Error removing friend:", error);
              Alert.alert("Error", "Unable to remove friend.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => router.replace("/friends")}
        style={styles.backButton}
      >
        <FontAwesome name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        <FlatList
          data={friends}
          keyExtractor={(item) => item.userId}
          renderItem={({ item }) => (
            <View style={styles.friendItem}>
              <Text style={styles.friendName}>{item.name}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => {
                  console.log("Remove button clicked for:", item.userId);
                  removeFriend(item.userId);
                }}
              >
                <Text style={styles.removeButtonText}>Remove Friend</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 130,
    backgroundColor: "#121212",
  },
  loadingText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
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
    elevation: 5,
  },
  friendItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
  },
  friendName: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  removeButton: {
    backgroundColor: "#FF4D4D",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default RemoveFriendsPage;
