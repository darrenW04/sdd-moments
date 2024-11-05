import React, { useState } from "react";
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

const screenWidth = Dimensions.get("window").width;

type Post = {
  id: string;
  user: string;
  caption: string;
  likes: number;
  videoId: string;
  liked: boolean;
};

const FeedView = () => {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      user: "user_name",
      caption: "This is a test post",
      likes: 1234,
      videoId: "K4DyBUG242c",
      liked: false,
    },
    {
      id: "2",
      user: "another_user",
      caption: "Another post",
      likes: 450,
      videoId: "K4DyBUG242c",
      liked: false,
    },
    // Add more posts here
  ]);

  // Function to handle like button press
  const handleLike = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const isLiked = !post.liked;
          return {
            ...post,
            likes: isLiked ? post.likes + 1 : post.likes - 1,
            liked: isLiked,
          };
        }
        return post;
      })
    );

    updateLikesOnServer(postId);
  };

  // Placeholder for the PUT request to update likes
  const updateLikesOnServer = async (postId: string) => {
    // Implement the PUT request logic here
    console.log(`Updating likes on server for post ID: ${postId}`);
  };

  const renderItem = ({ item }: { item: Post }) => (
    <View style={styles.postContainer}>
      {/* User Info */}
      <Text style={styles.username}>{item.user}</Text>

      {/* Video */}
      <View style={styles.videoContainer}>
        <WebView
          source={{
            uri: `https://www.youtube.com/embed/${item.videoId}?playsinline=1`,
          }}
          style={styles.webview}
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
        />
      </View>

      {/* Caption */}
      <Text style={styles.caption}>{item.caption}</Text>

      {/* Like Button */}
      <TouchableOpacity
        onPress={() => handleLike(item.id)}
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
      data={posts}
      keyExtractor={(item) => item.id}
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
