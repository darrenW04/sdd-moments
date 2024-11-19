import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { WebView } from "react-native-webview";
import { FontAwesome } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;

type FeedItemProps = {
  video: {
    _id: string;
    userId: string;
    videoUrl: string;
    title: string;
    description: string;
    likes: number;
    liked: boolean;
  };
  onLike: (videoId: string) => void; // Callback to parent
};

const FeedItem = ({ video, onLike }: FeedItemProps) => {
  const [liked, setLiked] = useState(video.liked);
  const [likes, setLikes] = useState(video.likes);

  const handleLike = async () => {
    const isLiked = !liked;
    setLiked(isLiked);
    setLikes(isLiked ? likes + 1 : likes - 1);
    onLike(video._id);

    try {
      console.log(video);
      console.log(video.likes);

      console.log("updating likes");
      //   await axios.put(`http://192.168.6.42:3000/api/videos/${video._id}/like`, {
      //     action: "toggle",
      //   });
    } catch (error) {
      console.error("Error updating likes on server:", error);
    }
  };

  return (
    <View style={styles.postContainer}>
      <Text style={styles.username}>{video.userId}</Text>
      <View style={styles.videoContainer}>
        <WebView
          source={{ uri: video.videoUrl }}
          style={styles.webview}
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
        />
      </View>
      <Text style={styles.caption}>{video.title}</Text>
      <Text style={styles.caption}>{video.description}</Text>
      <TouchableOpacity onPress={handleLike} style={styles.likeButton}>
        <FontAwesome
          name={liked ? "heart" : "heart-o"}
          size={24}
          color={liked ? "#FF6347" : "#fff"}
        />
        <Text style={styles.likes}>
          {likes === undefined || likes === null ? 1 : likes}
        </Text>
      </TouchableOpacity>
    </View>
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

export default FeedItem;
