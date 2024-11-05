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

const screenWidth = Dimensions.get("window").width;

type Post = {
  id: string;
  user: string;
  caption: string;
  likes: number;
  videoId: string; // Using YouTube video ID
};

const FeedView = () => {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      user: "user_name",
      caption: "This is a test post",
      likes: 1234,
      videoId: "dQw4w9WgXcQ",
    },
    {
      id: "2",
      user: "another_user",
      caption: "Another post",
      likes: 450,
      videoId: "3JZ_D3ELwOQ",
    },
    // Add more posts here
  ]);

  // Function to handle like button press
  const handleLike = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
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
      <Text style={styles.username}>{item.user}</Text>
      {/* <YoutubePlayer height={300} play={true} videoId={"84WIaK3bl_s"} /> */}
      {/* <WebView
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction
        source={{ uri: "https://www.youtube.com/watch?v=jzD_yyEcp0M" }}
      /> */}
      <View style={styles.videoContainer}>
        <WebView
          source={{
            uri: `https://www.youtube.com/embed/K4DyBUG242c`,
          }}
          style={styles.webview}
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
        />
      </View>
      <Text style={styles.caption}>{item.caption}</Text>
      <TouchableOpacity
        onPress={() => handleLike(item.id)}
        style={styles.likeButton}
      >
        <Text style={styles.likes}>Likes: {item.likes}</Text>
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
    fontSize: 16,
    marginBottom: 8,
  },
  videoContainer: {
    width: "100%",
    height: (screenWidth - 32) * (9 / 16), // Adjust for 16:9 aspect ratio
    marginBottom: 8,
  },
  webview: {
    flex: 1,
    borderRadius: 8,
  },
  caption: {
    color: "#fff",
    marginBottom: 8,
  },
  likeButton: {
    paddingVertical: 8,
    alignItems: "flex-start",
  },
  likes: {
    color: "#ccc",
    fontSize: 14,
  },
});

export default FeedView;
