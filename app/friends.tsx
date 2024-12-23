import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import FriendsProfilePage from "./FriendsProfilePage";
import { router } from "expo-router";

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
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchFriendsDetails = async () => {
      try {
        const currentUserId = await AsyncStorage.getItem("currentUserId");
        if (!currentUserId) {
          console.error("Current user ID not found");
          return;
        }

        const response = await axios.get(
          `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/users/${currentUserId}/friends-details`
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

  const openModal = (userId: string) => {
    setSelectedUserId(userId);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setSelectedUserId(null);
    setIsModalVisible(false);
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
      <SafeAreaView edges={["top"]} />

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace("/profile")}
      >
        <FontAwesome name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search friends..."
        placeholderTextColor="#bbb"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Friends List */}
      <FlatList
        data={filteredFriends}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.friendItem}
            onPress={() => openModal(item.userId)}
          >
            <Image
              source={{
                uri: item.avatar || "https://via.placeholder.com/100",
              }}
              style={styles.avatar}
            />
            <View style={styles.friendDetails}>
              <Text style={styles.friendName}>{item.name}</Text>
              <Text style={styles.friendStatus}>
                {`Status: ${item.status}`}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Add and Remove Friends Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/addFriends")}
        >
          <Text style={styles.actionButtonText}>Add Friends</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => router.push("/removeFriends")}
        >
          <Text style={styles.actionButtonText}>Remove Friends</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Friend Profile */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <FontAwesome name="close" size={24} color="#1E90FF" />
            </TouchableOpacity>
            {selectedUserId && (
              <FriendsProfilePage userId={selectedUserId} />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#121212",
  },
  loadingText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
  },
  backButton: {
    position: "absolute",
    top: 65,
    left: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1E90FF",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#1A1A1A",
    color: "#fff",
    paddingLeft: 10,
    borderRadius: 5,
    marginBottom: 20,
    marginTop: 60,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#1A1A1A",
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
    color: "#fff",
  },
  friendStatus: {
    fontSize: 14,
    color: "#bbb",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContent: {
    height: "50%",
    width: "90%",
    borderRadius: 10,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 5,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
  },
  addButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    marginRight: 10,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  removeButton: {
    flex: 1,
    backgroundColor: "#FF6347",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default FriendsPage;
