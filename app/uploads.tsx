import React, { useState, useRef } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UploadsPage() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView | null>(null); // Reference for CameraView

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

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      console.log("Stop recording...", cameraRef.current);
      cameraRef.current.stopRecording();
      setIsRecording(false);
    }
  };

  const toggleCameraFacing = () => {
    setFacing((prevFacing) => (prevFacing === "back" ? "front" : "back"));
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
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    backgroundColor: "transparent",
    alignSelf: "center",
    margin: 20,
  },
  button: {
    flex: 1,
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  videoContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
});
