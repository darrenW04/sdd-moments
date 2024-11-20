import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";

type FriendProfile = {
  username: string;
  profile_picture: string;
  friend_count: number;
  videos: Video[];
};

type Video = {
  videoId: string;
  title: string;
  videoUrl: string;
  uploadTime: string;
  userId: string; // Add userId property
};

const screenWidth = Dimensions.get("window").width;

type Props = {
  userId: string; // Take userId as a prop
};

const FriendsProfilePage = ({ userId }: Props) => {
  const [friend, setFriend] = useState<FriendProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriendProfile = async () => {
      try {
        const [profileResponse, videosResponse] = await Promise.all([
          axios.get(
            `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/users/${userId}`
          ),
          axios.get(
            `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/videos`
          ),
        ]);

        const filteredVideos = videosResponse.data.filter(
          (video: any) =>
            video.userId && String(video.userId) === String(userId)
        );

        const friendProfile: FriendProfile = {
          username: profileResponse.data.username,
          profile_picture: profileResponse.data.profile_picture,
          friend_count: profileResponse.data.friend_count,
          videos: filteredVideos,
        };
        console.log(videosResponse.data[0], "videosResponse");
        console.log(userId);
        console.log(friendProfile);
        console.log(filteredVideos);
        setFriend(friendProfile);
      } catch (error) {
        console.error("Error fetching friend's profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriendProfile();
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  if (!friend) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Friend's profile not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.friendCard}>
          <Image
            source={{
              uri: friend.profile_picture || "https://via.placeholder.com/100",
            }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{friend.username}</Text>
          <Text style={styles.friendCount}>Friends: {friend.friend_count}</Text>

          {/* Display Videos */}
          <Text style={styles.videoTitle}>Videos</Text>

          <FlatList
            data={friend.videos}
            keyExtractor={(item) => item.videoId}
            renderItem={({ item }) => (
              <View style={styles.videoCard}>
                <Text style={styles.videoTitle}>{item.title}</Text>
                <View style={styles.videoContainer}>
                  <WebView
                    source={{ uri: item.videoUrl }}
                    style={styles.webview}
                    allowsFullscreenVideo
                    allowsInlineMediaPlayback
                  />
                </View>
              </View>
            )}
            scrollEnabled={false} // Prevent internal scrolling
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#121212",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 16,
  },
  friendCard: {
    backgroundColor: "#1E1E1E",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    alignSelf: "center",
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  friendCount: {
    fontSize: 16,
    color: "#BBBBBB",
    textAlign: "center",
    marginBottom: 10,
  },
  videoCard: {
    marginTop: 10,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  videoContainer: {
    width: "100%",
    height: (screenWidth - 32) * (9 / 16),
    marginBottom: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  webview: {
    flex: 1,
  },
  emptyText: {
    fontSize: 18,
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },
});

export default FriendsProfilePage;
