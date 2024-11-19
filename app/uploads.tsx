import React, { useState, useRef, useEffect } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { Video, ResizeMode } from "expo-av"; // Import Video and ResizeMode components
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library"; // Import MediaLibrary for saving videos
import { UploadCachedVideo, uploadVideoToVimeo } from "./uploadVimeo";
import * as FileSystem from "expo-file-system";
export default function UploadsPage() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView | null>(null); // Reference for CameraView
  const videoRef = useRef<Video | null>(null); // Reference for Video component
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] =
    useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

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
  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);
    if (result.assets) {
      setVideoUri(result.assets[0].uri);
      uploadVideoToVimeo(result);
    }
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

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
    }
  };

  const toggleCameraFacing = () => {
    setFacing((prevFacing) => (prevFacing === "back" ? "front" : "back"));
  };

  const uploadVideo = async () => {
    if (videoUri) {
      // Call the function to upload video using the video URI
      pickMedia();
    }
  };

  const downloadAndSaveVideo = async () => {
    try {
      if (videoUri === null) {
        return;
      }
      const fileInfo = await FileSystem.getInfoAsync(videoUri);
      console.log("File Info:", fileInfo);
      UploadCachedVideo(videoUri);
    } catch (error) {
      console.error("Error getting file info:", error);
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
          <TouchableOpacity style={styles.button2} onPress={uploadVideo}>
            <Text style={styles.text}>Upload</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button2}
            onPress={() => {
              downloadAndSaveVideo();
            }}
          >
            <Text style={styles.text}>Save</Text>
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
  button2: {
    alignItems: "center", // Centers text horizontally
    justifyContent: "center", // Centers text vertically
    paddingVertical: 20, // Increases vertical padding
    paddingHorizontal: 40, // Increases horizontal padding
    backgroundColor: "#1E90FF", // Blue background for visibility
    marginHorizontal: 10, // Adjusts spacing between buttons
    borderRadius: 10, // Slightly more rounded corners
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
