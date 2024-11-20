import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  RefreshControl,
  View,
  Text,
} from "react-native";
import FeedItem from "./FeedItem";
import axios from "axios";

type Video = {
  _id: string;
  videoId: string;
  userId: string;
  videoUrl: string;
  title: string;
  description: string;
  likes: number;
  liked: boolean;
  uploadTime: string; // Ensure this field exists
  comments: any[]; // Ensure this field exists
};

const FeedList = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [refreshing, setRefreshing] = useState(false); // For pull-to-refresh

  const fetchVideos = async () => {
    console.log("Fetching videos");
    try {
      const response = await axios.get(
        `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/videos`
      );
      const fetchedVideos = response.data
        .map((video: Video) => ({
          ...video,
          liked: false,
          likes: video.likes,
        }))
        .sort(
          (a: Video, b: Video) =>
            new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime()
        ); // Sort by uploadTime in descending order (most recent first)
      //   console.log(fetchedVideos[1].comments);
      setVideos(fetchedVideos);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVideos();
    setRefreshing(false);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#1E90FF"]} // Refresh icon color
          tintColor="#1E90FF" // iOS loading spinner color
        />
      }
    >
      {videos.length > 0 ? (
        videos.map((video, index) => (
          <FeedItem
            key={index}
            video={video}
            onLike={function (videoId: string): void {
              console.log("not implemented, but would update likes on server");
            }}
          />
        ))
      ) : (
        <View style={styles.emptyMessage}>
          <Text style={styles.emptyText}>No videos available</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // Ensure full scrollability even with fewer items
    padding: 16,
  },
  emptyMessage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: "#777",
  },
});

export default FeedList;
