import React, { useState, useRef, useEffect } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { Video, ResizeMode } from "expo-av"; // Import Video and ResizeMode components
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library"; // Import MediaLibrary for saving videos

async function pickAndUploadVideo() {
  try {
    // Open the document picker to select a video file
    const result = await DocumentPicker.getDocumentAsync({
      type: "video/*", // Only allow video files
    });

    // Check if the user canceled the document picker
    if (result.canceled) {
      console.log("User canceled the picker");
      return;
    }

    // Ensure that there are assets selected (result.assets)
    if (!result.assets || result.assets.length === 0) {
      console.log("No assets selected");
      return;
    }

    // Get the first asset (video) from the assets array
    const videoAsset = result.assets[0];

    // Extract URI, name, and type from the asset
    const fileUri = videoAsset.uri;
    const fileName = videoAsset.name || fileUri.split("/").pop(); // Fallback if name is missing
    const fileType = videoAsset.mimeType || "video/mp4"; // Default MIME type if missing

    // Prepare the form data to send to the server
    const formData = new FormData();
    const fileBlob = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const blob = new Blob([fileBlob], { type: fileType });
    formData.append("file", blob, fileName);

    // Send the file to the server
    const response = await axios.post(
      "http://129.161.88.59:3000/api/vimeo",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log(
      "Video uploaded successfully. Video URI:",
      response.data.videoUri
    );
  } catch (error) {
    console.error("Error uploading video:", error);
  }
}

export default function UploadsPage() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView | null>(null); // Reference for CameraView
  const videoRef = useRef<Video | null>(null); // Reference for Video component
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] =
    useState(false);
  useEffect(() => {
    const getPermissions = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(status === "granted");
    };

    getPermissions();
  }, []);
  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const startRecording = async () => {
    if (cameraRef.current && !isRecording) {
      setIsRecording(true);
      try {
        console.log("Start recording...");
        const recordedVideo = await cameraRef.current.recordAsync({
          maxDuration: 30, // max duration in seconds
          maxFileSize: 50 * 1024 * 1024, // max file size in bytes (50 MB)
        });
        console.log("Recorded video:", recordedVideo);
        if (recordedVideo?.uri) {
          setVideoUri(recordedVideo.uri);
          console.log("Recorded video URI:", recordedVideo.uri);
        }
      } catch (error) {
        console.error("Error recording video:", error);
      } finally {
        setIsRecording(false);
      }
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);

      if (videoUri) {
        console.log("Saving video to Camera Roll...");

        try {
          // Check if permissions are granted before saving
          if (!hasMediaLibraryPermission) {
            console.log("No media library permission.");
            return;
          }

          const asset = await MediaLibrary.createAssetAsync(videoUri);
          const album = await MediaLibrary.createAlbumAsync(
            "Camera",
            asset,
            false
          );

          console.log("Video saved to Camera Roll:", asset.uri);
        } catch (error) {
          console.error("Error saving video to Camera Roll:", error);
        }
      } else {
        console.log("No video URI found to save.");
      }
    }
  };

  const toggleCameraFacing = () => {
    setFacing((prevFacing) => (prevFacing === "back" ? "front" : "back"));
  };

  const uploadVideo = async () => {
    if (videoUri) {
      // Call the function to upload video using the video URI
      pickAndUploadVideo();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        style={styles.camera}
        mode="video"
        facing={facing}
        ref={cameraRef}
        mirror={facing === "front"} // Use mirror prop directly for front camera
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={startRecording}>
            <Text style={styles.text}>
              {isRecording ? "Recording..." : "Record"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={stopRecording}>
            <Text style={styles.text}>Stop</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
      {videoUri && (
        <View style={styles.videoContainer}>
          <Text>Video saved at: {videoUri}</Text>
          <TouchableOpacity style={styles.button} onPress={uploadVideo}>
            <Text style={{ color: "black" }}>Upload</Text>
          </TouchableOpacity>
          <Video
            ref={videoRef}
            source={{ uri: videoUri }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isLooping
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#000", // Helps buttons and text stand out
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    color: "white",
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
    alignSelf: "center",
    padding: 10,
    borderRadius: 8,
  },
  button: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#1E90FF", // Blue background for visibility
    marginHorizontal: 5,
    borderRadius: 5,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  videoContainer: {
    padding: 16,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: 300,
    backgroundColor: "black",
  },
});
