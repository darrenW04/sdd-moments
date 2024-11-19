import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet } from "react-native";
import FeedItem from "./FeedItem";
import axios from "axios";

type Video = {
  _id: string;
  userId: string;
  videoUrl: string;
  title: string;
  description: string;
  likes: number;
  liked: boolean;
};

const FeedList = () => {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get("http://192.168.6.42:3000/api/videos");
        const fetchedVideos = response.data.map((video: Video) => ({
          ...video,
          liked: false,
          likes: video.likes,
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
      prevVideos.map((video) =>
        video._id === videoId ? { ...video, liked: !video.liked } : video
      )
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {videos.map((video) => (
        <FeedItem key={video._id} video={video} onLike={handleLike} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});

export default FeedList;
