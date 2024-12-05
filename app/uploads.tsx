import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Image,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { Video, ResizeMode } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";
import * as MediaLibrary from "expo-media-library";
import { UploadCachedVideo, uploadVideoToVimeo } from "./uploadVimeo";
import * as ImagePicker from "expo-image-picker";
import { Ionicons as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router"; // Assuming you're using expo-router

export default function UploadsPage() {
  const router = useRouter(); // Add this for navigation
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false); // State for overlay/modal
  const cameraRef = useRef<CameraView | null>(null);
  const videoRef = useRef<Video | null>(null);
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
          maxDuration: 30,
          maxFileSize: 50 * 1024 * 1024,
        });
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
      setIsModalVisible(true); // Show overlay when recording stops
    }
  };

  const toggleCameraFacing = () => {
    setFacing((prevFacing) => (prevFacing === "back" ? "front" : "back"));
  };

  const uploadVideo = async () => {
    if (videoUri) {
      setIsModalVisible(false);
      console.log("Uploading video...");
      await UploadCachedVideo(videoUri);
      console.log("Video uploaded successfully!");
    }
  };

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
      // setImage(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        style={styles.camera}
        mode="video"
        facing={facing}
        ref={cameraRef}
        mirror={facing === "front"}
      >
        <View style={styles.buttonContainer}>
          {/* Flip Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={toggleCameraFacing}
          >
            <Icon name="camera-reverse-outline" size={40} color="white" />
          </TouchableOpacity>

          {/* Record Button */}
          <TouchableOpacity style={styles.iconButton} onPress={startRecording}>
            <Icon
              name={
                isRecording ? "stop-circle-outline" : "radio-button-on-outline"
              }
              size={40}
              color={isRecording ? "red" : "white"}
            />
          </TouchableOpacity>

          {/* Stop Button */}
          <TouchableOpacity style={styles.iconButton} onPress={stopRecording}>
            <Icon name="stop-outline" size={40} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>

      {/* Overlay/Modal for video preview */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.overlay}>
          {videoUri && (
            <>
              <Video
                ref={videoRef}
                source={{ uri: videoUri }}
                style={styles.previewVideo}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping
              />
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={uploadVideo}
              >
                <Text style={styles.text}>Upload</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.text}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace("/home")}
      >
        <Icon name="arrow-back-outline" size={24} color="white" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      {/* Album button */}
      <TouchableOpacity style={styles.albumButton} onPress={pickMedia}>
        <Image
          source={{ uri: "https://img.icons8.com/ios/50/ffffff/albums.png" }}
          style={styles.albumIcon}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#000",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    // position: "absolute",
    width: 100,
    top: 20,
    left: 10,
    backgroundColor: "rgba(500, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 8,
    zIndex: 10,
  },
  backButtonText: {
    marginLeft: 5,
    color: "white",
    fontSize: 16,
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    color: "white",
  },
  camera: {
    flex: 1,
  },
  iconButton: {
    marginHorizontal: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    alignSelf: "center",
    padding: 10,
    borderRadius: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewVideo: {
    width: "90%",
    height: 300,
    backgroundColor: "black",
  },
  uploadButton: {
    backgroundColor: "#1E90FF",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
  },
  cancelButton: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 10,
  },
  albumButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#1E90FF",
    padding: 10,
    borderRadius: 30,
  },
  albumIcon: {
    width: 30,
    height: 30,
    tintColor: "white",
  },
  text: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
});
