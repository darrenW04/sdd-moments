import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { WebView } from "react-native-webview";
import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;
const fetchUserProfile = async (userId: string) => {
  try {
    // Make the API calls concurrently
    const [profileResponse, videoResponse] = await Promise.all([
      axios.get(
        `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/users/${userId}`
      ),
      axios.get(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/videos`),
    ]);

    // Extract profile data
    const profile = profileResponse.data;

    // Filter videos specific to the given userId
    const filteredVideos = videoResponse.data.filter(
      (video: any) => video.userId === userId
    );

    // Return the profile and videos as an object
    return {
      profile,
      videos: filteredVideos,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error; // Re-throw the error for further handling if needed
  }
};
type FeedItemProps = {
  video: {
    _id: string;
    videoId: string;
    userId: string;
    videoUrl: string;
    title: string;
    description: string;
    likes: number;
    liked: boolean;
    uploadTime: string;
    comments: { userId: string; comment: string }[];
  };
  onLike: (videoId: string) => void;
};

const FeedItem = ({ video, onLike }: FeedItemProps) => {
  const [liked, setLiked] = useState(video.liked);
  const [likes, setLikes] = useState(video.likes);
  const [comments, setComments] = useState(
    video.comments.map((comment) => ({
      ...comment,
      username: "", // Placeholder for username
    }))
  );
  const [newComment, setNewComment] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // Store current user's ID

  // Fetch currentUserId
  useEffect(() => {
    const fetchCurrentUserId = async () => {
      const userId = await AsyncStorage.getItem("currentUserId");
      setCurrentUserId(userId);
    };

    fetchCurrentUserId();
  }, []);

  // Fetch usernames for each comment userId
  useEffect(() => {
    const fetchCommentUsernames = async () => {
      try {
        const updatedComments = await Promise.all(
          comments.map(async (comment) => {
            if (comment.userId === currentUserId) {
              return {
                ...comment,
                username: "You", // If it's the current user, set "You"
              };
            }

            try {
              const { profile } = await fetchUserProfile(comment.userId);
              return {
                ...comment,
                username: profile.username,
              };
            } catch (error) {
              console.error(
                `Error fetching username for userId ${comment.userId}:`,
                error
              );
              return {
                ...comment,
                username: "Unknown User", // Fallback if error occurs
              };
            }
          })
        );
        setComments(updatedComments);
      } catch (error) {
        console.error("Error fetching usernames for comments:", error);
      }
    };

    fetchCommentUsernames();
  }, [video.comments, currentUserId]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUserId) return;

    try {
      const response = await axios.post(
        `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/videos/comments`,
        {
          videoId: video.videoId,
          userId: currentUserId,
          comment: newComment.trim(),
        }
      );

      if (response.status === 200) {
        setComments([
          ...comments,
          {
            userId: currentUserId,
            comment: newComment.trim(),
            username: "You",
          },
        ]);
        setNewComment(""); // Clear the input field
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <View style={styles.postContainer}>
      <Text style={styles.username}>{video.title}</Text>
      <View style={styles.videoContainer}>
        <WebView
          source={{ uri: video.videoUrl }}
          style={styles.webview}
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
        />
      </View>
      <Text style={styles.caption}>
        {new Date(video.uploadTime).toLocaleString()}
      </Text>
      <Text style={styles.caption}>{video.description}</Text>
      <TouchableOpacity
        onPress={() => onLike(video._id)}
        style={styles.likeButton}
      >
        <FontAwesome
          name={liked ? "heart" : "heart-o"}
          size={24}
          color={liked ? "#FF6347" : "#fff"}
        />
        <Text style={styles.likes}>{likes}</Text>
      </TouchableOpacity>

      {/* Comments Section */}
      <View style={styles.commentsSection}>
        <Text style={styles.commentsHeader}>Comments</Text>
        {comments.map((comment, index) => (
          <Text key={index} style={styles.comment}>
            <Text style={styles.commentUser}>
              {comment.username || "Loading..."}:{" "}
            </Text>
            {comment.comment}
          </Text>
        ))}
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            placeholderTextColor="#BBB"
            value={newComment}
            onChangeText={setNewComment}
          />
          <TouchableOpacity
            onPress={handleAddComment}
            style={styles.postButton}
          >
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  commentsSection: {
    marginTop: 16,
  },
  commentsHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  comment: {
    fontSize: 14,
    color: "#BBBBBB",
    marginBottom: 5,
  },
  commentUser: {
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
    color: "#FFFFFF",
    backgroundColor: "#121212",
    marginRight: 10,
  },
  postButton: {
    backgroundColor: "#1E90FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
  },
  postButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

export default FeedItem;
