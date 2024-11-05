import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import React from "react";
import { useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function UploadsPage() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  // const [camera, setCamera] = useState(null);
  const camera = React.useRef<CameraView | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // const [type, setType] = useState(Camera.Constants.Type.back);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }
  const takeVideo = async () => {
    if (camera.current && !isRecording) {
      console.log("Starting recording...");
      setIsRecording(true); // Update the recording state
      try {
        const data = await camera.current.recordAsync(); // Await the promise from recordAsync
        console.log(data);
        if (data?.uri) {
          setVideoUri(data.uri); // Set the URI of the recorded video
          console.log("Recorded video URI:", data.uri);
        }
      } catch (error) {
        console.error("Error recording video:", error);
      } finally {
        setIsRecording(false); // Ensure recording state is updated
      }
    }
  };
  const stopVideo = () => {
    if (camera.current && isRecording) {
      console.log("Stopping recording...");
      camera.current.stopRecording();
      setIsRecording(false);
    }
  };

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={camera}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takeVideo}>
            <Text style={styles.text}>Record</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={stopVideo}>
            <Text style={styles.text}>Stop</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
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
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
