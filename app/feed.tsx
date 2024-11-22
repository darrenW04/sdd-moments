import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { WebView } from "react-native-webview";
import { FontAwesome } from "@expo/vector-icons"; // Use '@expo/vector-icons' for Expo projects
import axios from "axios";

const screenWidth = Dimensions.get("window").width;

type Video = {
  _id: string;
  videoId: string;
  userId: string;
  videoUrl: string;
  title: string;
  description: string;
  isPublic: boolean;
  uploadTime: string;
  viewCount: number;
  liked: boolean; // This property can be added to manage local state
  likes: number; // Placeholder for like count, if needed
};

const FeedView = () => {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    // Fetch videos from the API
    const fetchVideos = async () => {
      try {
        const response = await axios.get(
          `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/videos`
        ); // Ensure this matches your server's IP and port
        const fetchedVideos = response.data.map((video: Video) => ({
          ...video,
          liked: false, // Default to not liked
          likes: video.viewCount, // Use view count as a placeholder for likes
        }));
        setVideos(fetchedVideos);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };

    fetchVideos();
  }, []);

  // Function to handle like button press
  const handleLike = (videoId: string) => {
    setVideos((prevVideos) =>
      prevVideos.map((video) => {
        if (video._id === videoId) {
          const isLiked = !video.liked;
          return {
            ...video,
            likes: isLiked ? video.likes + 1 : video.likes - 1,
            liked: isLiked,
          };
        }
        return video;
      })
    );

    updateLikesOnServer(videoId);
  };

  // Placeholder for the PUT request to update likes
  const updateLikesOnServer = async (videoId: string) => {
    // Implement the PUT request logic here
    console.log(`Updating likes on server for video ID: ${videoId}`);
  };

  const renderItem = ({ item }: { item: Video }) => (
    <View style={styles.postContainer}>
      {/* User Info */}
      <Text style={styles.username}>{item.userId}</Text>

      {/* Video */}
      <View style={styles.videoContainer}>
        <WebView
          source={{
            uri: item.videoUrl,
          }}
          style={styles.webview}
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
        />
      </View>

      {/* Title and Description */}
      <Text style={styles.caption}>{item.title}</Text>
      <Text style={styles.caption}>{item.description}</Text>

      {/* Like Button */}
      <TouchableOpacity
        onPress={() => handleLike(item._id)}
        style={styles.likeButton}
      >
        <FontAwesome
          name={item.liked ? "heart" : "heart-o"}
          size={24}
          color={item.liked ? "#FF6347" : "#fff"}
        />
        <Text style={styles.likes}>{item.likes}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={videos}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  postContainer: {
    padding: 16,
    backgroundColor: "#1a1a1a",
    marginBottom: 16,
    borderRadius: 8,
  },
  username: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  videoContainer: {
    width: "100%",
    height: (screenWidth - 32) * (9 / 16), // Adjust for 16:9 aspect ratio
    marginBottom: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  webview: {
    flex: 1,
  },
  caption: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  likes: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
  },
});

export default FeedView;
