import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { WebView } from "react-native-webview";
import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";

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
  liked: boolean;
  likes: number;
};

const FeedView = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get("http://192.168.6.61:3000/api/videos");
        const fetchedVideos = response.data.map((video: Video) => ({
          ...video,
          liked: false,
          likes: video.viewCount,
        }));
        setVideos(fetchedVideos);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };

    fetchVideos();
  }, []);

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

  const updateLikesOnServer = async (videoId: string) => {
    console.log(`Updating likes on server for video ID: ${videoId}`);
  };

  const renderItem = ({ item }: { item: Video }) => (
    <View style={styles.postContainer}>
      <Text style={styles.username}>{item.userId}</Text>
      <View style={styles.videoContainer}>
        <WebView
          source={{ uri: item.videoUrl }}
          style={styles.webview}
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
        />
      </View>
      <Text style={styles.caption}>{item.title}</Text>
      <Text style={styles.caption}>{item.description}</Text>
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Feed</Text>
        <TouchableOpacity
          onPress={() => router.push("./profile")}
          style={styles.profileIconContainer}
        >
          <Image
            source={{
              uri: "https://via.placeholder.com/50", // Replace with user profile picture if available
            }}
            style={styles.profileIcon}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={videos}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#1a1a1a",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  profileIconContainer: {
    borderRadius: 25,
    overflow: "hidden",
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc",
  },
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
    height: (screenWidth - 32) * (9 / 16),
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
