// import { Vimeo } from '@vimeo/player';
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Base64 } from "js-base64";

("w2gw6E7aD3ptF2eZY5ASB4y5WeJPx3bzdTFk9yz1uD1W7KPRMRE726YthQnD/zSGkkFZo9efYmm4MbQ6jxHWJNnaj/zwR6BRGhoDpRjU7qdbF/ueIYeeaEAI6kIe48A8");
const VIMEO_ACCESS_TOKEN = "32277fd36fa4e8eb1f850797ffe557aa";

// Put your own Vimeo access token
export async function uploadVideoToVimeo(video: ImagePicker.ImagePickerResult) {
  try {
    if (!video.assets || video.assets.length === 0) {
      throw new Error("No video asset found");
    }

    const fileInfo = video.assets[0];
    const fileSize = fileInfo.fileSize; // Get file size in bytes
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
      // Read the chunk as Base64
      const base64Chunk = await FileSystem.readAsStringAsync(tempFilePath, {
        encoding: FileSystem.EncodingType.Base64,
        position: uploadOffset,
        length: chunkSize,
      });
      const binaryChunk = Base64.toUint8Array(base64Chunk);
      // Decode Base64 to binary Uint8Array

      // Send binary data directly
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
    const vimeoVideoUrl2 = createResponse.data?.uri;
    const videoUrlData = createResponse.data.player_embed_url;
    console.log(createResponse.data);
    console.log("Upload complete. Video available at:", `${videoUrlData}`);
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

export async function UploadCachedVideo(videoUri: string) {
  try {
    const fileInfo = await FileSystem.getInfoAsync(videoUri);
    console.log("File Info:", fileInfo);
    const uri = fileInfo.uri;
    const fileSize = fileInfo.size;
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
    const videoUrlData = createResponse.data.player_embed_url;

    console.log("Upload complete. Video available at:", `${videoUrlData}`);

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
