// import { Vimeo } from '@vimeo/player';
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Base64 } from "js-base64";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

("w2gw6E7aD3ptF2eZY5ASB4y5WeJPx3bzdTFk9yz1uD1W7KPRMRE726YthQnD/zSGkkFZo9efYmm4MbQ6jxHWJNnaj/zwR6BRGhoDpRjU7qdbF/ueIYeeaEAI6kIe48A8");
const VIMEO_ACCESS_TOKEN = "32277fd36fa4e8eb1f850797ffe557aa";

// Put your own Vimeo access token
export async function uploadVideoToVimeo(video: ImagePicker.ImagePickerResult) {
  try {
    if (!video.assets || video.assets.length === 0) {
      throw new Error("No video asset found");
    }

    const fileInfo = video.assets[0];
    const fileSize = fileInfo.fileSize;
    const videoUri = fileInfo.uri;

    if (!fileSize || !videoUri) {
      throw new Error("File size or URI is missing");
    }

    // Step 1: Copy file to a readable location
    const tempFilePath = FileSystem.documentDirectory + "temp_video.mov";
    await FileSystem.copyAsync({
      from: videoUri,
      to: tempFilePath,
    });

    // Step 2: Create Vimeo upload session
    const createResponse = await axios.post(
      "https://api.vimeo.com/me/videos",
      {
        upload: {
          approach: "tus",
          size: fileSize.toString(),
        },
      },
      {
        headers: {
          Authorization: `bearer ${VIMEO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.vimeo.*+json;version=3.4",
        },
      }
    );

    const { upload_link: uploadLink, uri: vimeoVideoUri } =
      createResponse.data.upload;

    console.log("Vimeo Upload Link:", uploadLink);
    console.log("Vimeo Video URI:", vimeoVideoUri);

    // Step 3: Upload the video in chunks
    let uploadOffset = 0;
    const chunkSize = 5 * 1024 * 1024; // 5MB chunks

    while (uploadOffset < fileSize) {
      const base64Chunk = await FileSystem.readAsStringAsync(tempFilePath, {
        encoding: FileSystem.EncodingType.Base64,
        position: uploadOffset,
        length: chunkSize,
      });
      const binaryChunk = Base64.toUint8Array(base64Chunk);

      const patchResponse = await axios.patch(uploadLink, binaryChunk, {
        headers: {
          "Tus-Resumable": "1.0.0",
          "Upload-Offset": uploadOffset.toString(),
          "Content-Type": "application/offset+octet-stream",
        },
      });

      uploadOffset = parseInt(patchResponse.headers["upload-offset"], 10);
      console.log(`Uploaded chunk: ${uploadOffset}/${fileSize}`);
    }

    const vimeoVideoUrl = createResponse.data.player_embed_url;
    console.log("Upload complete. Video available at:", vimeoVideoUrl);

    // Step 4: Push the video to the database
    const currentUserId = await AsyncStorage.getItem("currentUserId");
    if (!currentUserId) {
      throw new Error("Current user ID not found.");
    }
    console.log(createResponse.data);
    const videoDetails = {
      video_id: createResponse.data.resource_key, // Extract video ID from Vimeo URI
      user_id: currentUserId,
      video_url: vimeoVideoUrl,
      title: "New Video", // Placeholder title, can be customized
      description: "Uploaded via app", // Placeholder description
      is_public: true,
      upload_time: createResponse.data.created_time,
      view_count: 0,
      likes: 0,
      comments: [],
    };

    const databaseResponse = await axios.post(
      `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/videos`,
      videoDetails
    );

    console.log("Video pushed to database:", databaseResponse.data);
    Alert.alert("Video uploaded successfully!");
    return vimeoVideoUrl;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Error uploading to Vimeo:",
        error.response?.data || error.message
      );
    } else {
      if (error instanceof Error) {
        console.error("Error uploading to Vimeo:", error.message);
      } else {
        console.error("Error uploading to Vimeo:", error);
      }
    }
  }
}

export async function UploadCachedVideo(videoUri: string) {
  try {
    const fileInfo = await FileSystem.getInfoAsync(videoUri);
    console.log("File Info:", fileInfo);
    const uri = fileInfo.uri;
    const fileSize = fileInfo.size; // Ignore this error line, THERES LITERALLY A .SIZE AND IT WORKS
    if (!uri || !fileSize) {
      throw new Error("File URI or size is missing.");
    }

    // Step 1: Create Vimeo upload session
    const createResponse = await axios.post(
      "https://api.vimeo.com/me/videos",
      {
        upload: {
          approach: "tus",
          size: fileSize.toString(),
        },
      },
      {
        headers: {
          Authorization: `bearer ${VIMEO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.vimeo.*+json;version=3.4",
        },
      }
    );

    const { upload_link: uploadLink, uri: vimeoVideoUri } =
      createResponse.data.upload;

    console.log("Vimeo Upload Link:", uploadLink);
    console.log("Vimeo Video URI:", vimeoVideoUri);

    // Step 2: Upload the video in chunks
    let uploadOffset = 0;
    const chunkSize = 5 * 1024 * 1024; // 5MB chunks

    while (uploadOffset < fileSize) {
      const base64Chunk = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
        position: uploadOffset,
        length: chunkSize,
      });

      const binaryChunk = Uint8Array.from(atob(base64Chunk), (c) =>
        c.charCodeAt(0)
      );

      const patchResponse = await axios.patch(uploadLink, binaryChunk, {
        headers: {
          "Tus-Resumable": "1.0.0",
          "Upload-Offset": uploadOffset.toString(),
          "Content-Type": "application/offset+octet-stream",
        },
      });

      uploadOffset = parseInt(patchResponse.headers["upload-offset"], 10);
      console.log(`Uploaded chunk: ${uploadOffset}/${fileSize}`);
    }

    const vimeoVideoUrl = createResponse.data.player_embed_url;

    // Step 4: Push the video to the database
    const currentUserId = await AsyncStorage.getItem("currentUserId");
    if (!currentUserId) {
      throw new Error("Current user ID not found.");
    }
    console.log(createResponse.data);
    const videoDetails = {
      video_id: createResponse.data.resource_key, // Extract video ID from Vimeo URI
      user_id: currentUserId,
      video_url: vimeoVideoUrl,
      title: "New Video", // Placeholder title, can be customized
      description: "Uploaded via app", // Placeholder description
      is_public: true,
      upload_time: createResponse.data.created_time,
      view_count: 0,
      likes: 0,
      comments: [],
    };

    const databaseResponse = await axios.post(
      `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:3000/api/videos`,
      videoDetails
    );

    console.log("Video pushed to database:", databaseResponse.data);
    Alert.alert("Video uploaded successfully!");
    return `https://vimeo.com${vimeoVideoUri}`;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Error uploading to Vimeo:",
        error.response?.data || error.message
      );
    } else {
      if (error instanceof Error) {
        console.error("Error uploading to Vimeo:", error.message);
      } else {
        console.error("Error uploading to Vimeo:", error);
      }
    }
  }
}
