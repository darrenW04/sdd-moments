import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { Video } from 'expo-av';

export default function UploadsPage() {
  const [facing, setFacing] = useState<CameraType>('back'); // Toggle between front and back cameras
  const [permission, requestPermission] = useCameraPermissions(); // Handle permissions
  const [isRecording, setIsRecording] = useState(false); // Manage recording state
  const [videoUri, setVideoUri] = useState<string | null>(null); // Store video URI
  const cameraRef = useRef(null); // Ref to access the camera component

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions not granted
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  // Toggle between front and back camera
  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  // Start and stop video recording
  const toggleRecording = async () => {
    if (cameraRef.current) {
      if (isRecording) {
        cameraRef.current.stopRecording(); // Stop recording
        setIsRecording(false);
      } else {
        setIsRecording(true);
        const video = await cameraRef.current.recordAsync(); // Start recording
        setVideoUri(video.uri); // Store the video URI after recording
        setIsRecording(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      {videoUri ? (
        // Display the recorded video
        <Video
          source={{ uri: videoUri }}
          style={styles.video}
          useNativeControls
          resizeMode="contain"
          isLooping
        />
      ) : (
        // Show the camera preview if no video is recorded yet
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.controlsContainer}>
            {/* Mute button */}
            <TouchableOpacity style={styles.controlButton}>
              <Text style={styles.controlText}>🔇</Text>
            </TouchableOpacity>

            {/* Recording button */}
            <TouchableOpacity
              style={isRecording ? styles.stopButton : styles.recordButton}
              onPress={toggleRecording}
            >
              <View style={styles.recordIndicator} />
            </TouchableOpacity>

            {/* Flip camera button */}
            <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
              <Text style={styles.controlText}>🔄</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      )}

      {/* Caption Input */}
      {!videoUri && (
        <View style={styles.captionContainer}>
          <TextInput
            style={styles.captionInput}
            placeholder="Add a caption..."
            placeholderTextColor="#999"
            onChangeText={() => {}}
          />
          <TouchableOpacity style={styles.sendButton}>
            <Text style={styles.sendButtonText}>SEND ➤</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    textAlign: 'center',
    color: '#fff',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  controlButton: {
    padding: 20,
  },
  controlText: {
    fontSize: 30,
    color: '#fff',
  },
  recordButton: {
    width: 80,
    height: 80,
    backgroundColor: 'red',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButton: {
    width: 80,
    height: 80,
    backgroundColor: 'orange',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordIndicator: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  video: {
    flex: 1,
    width: '100%',
  },
  captionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#222',
  },
  captionInput: {
    flex: 1,
    color: '#fff',
    backgroundColor: '#333',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

