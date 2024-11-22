import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import FeedItem from "./FeedItem";

type Video = {
  _id: string;
  videoId: string;
  userId: string;
  videoUrl: string;
  title: string;
  description: string;
  likes: number;
  liked: boolean;
  uploadTime: string;
  comments: any[];
};

type Props = {
  userIds: string[]; // List of user IDs to filter videos
};

const FilteredVideos = ({ userIds }: Props) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndFilterVideos = async () => {
      console.log(userIds);
      setLoading(true);
      try {
        const response = await axios.get(
          `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/videos`
        );

        if (response.data) {
          const filteredVideos = response.data.filter((video: Video) => {
            // Ensure both userIds and video.userId are strings
            const normalizedUserIds = userIds.map((id) => String(id));
            return normalizedUserIds.includes(String(video.userId));
          });

          // Sort the filtered videos by uploadTime in descending order
          const sortedVideos = filteredVideos.sort(
            (a: Video, b: Video) =>
              new Date(b.uploadTime).getTime() -
              new Date(a.uploadTime).getTime()
          );
          console.log(filteredVideos);
          setVideos(sortedVideos);
        }
        console.log(response.data[2].userId);
      } catch (error) {
        console.error("Error fetching and filtering videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterVideos();
  }, [userIds]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  if (videos.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No videos to display</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {videos.map((video, index) => (
        <FeedItem
          key={index}
          video={video}
          onLike={(videoId) => {
            console.log(`Liked video with ID: ${videoId}`);
          }}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#121212",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  emptyText: {
    fontSize: 18,
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },
});

export default FilteredVideos;
