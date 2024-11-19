// import { Vimeo } from '@vimeo/player';
import axios from "axios";

const CLIENT_ID = "ce2269c67a4d363873de20f02b4a9cf47dc52722";
const CLIENT_SECRET =
  "w2gw6E7aD3ptF2eZY5ASB4y5WeJPx3bzdTFk9yz1uD1W7KPRMRE726YthQnD/zSGkkFZo9efYmm4MbQ6jxHWJNnaj/zwR6BRGhoDpRjU7qdbF/ueIYeeaEAI6kIe48A8";
const VIMEO_ACCESS_TOKEN = "32277fd36fa4e8eb1f850797ffe557aa";
const VIMEO_API_URL = "https://api.vimeo.com/me/videos";
const ACCESS_TOKEN = "32277fd36fa4e8eb1f850797ffe557aa";

// Put your own Vimeo access token

// Function to get the video file size
export const uploadVideoToVimeo = async (uri: string) => {
  try {
    const response = await axios.post("http://192.168.6.42:3000/api/vimeo", {
      filePath: uri,
    });
    console.log(
      "Video uploaded successfully. Video URI:",
      response.data.videoUri
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Error uploading video:",
        error.response?.data || error.message
      );
    } else {
      console.error("Error uploading video:", error);
    }
  }
};
// // Function to get the size of the video file
// const getVideoSize = async (uri: string) => {
//   try {
//     // Get file metadata (size, etc.)
//     const fileInfo = await FileSystem.getInfoAsync(uri);
//     if (fileInfo.exists) {
//       console.log(`Video size: ${fileInfo.size} bytes`);
//       return fileInfo.size; // Size in bytes
//     } else {
//       console.error("File does not exist at the specified URI.");
//       return null;
//     }
//   } catch (error) {
//     console.error("Error getting file size:", error);
//     return null;
//   }
// };

// export const uploadVideoToVimeo = async (fileUri: string) => {
//   console.log("Uploading video to Vimeo...");
//   console.log("File URI:", fileUri);

//   try {
//     // Step 1: Get the video file size
//     const size = await getVideoSize(fileUri);
//     if (!size) {
//       throw new Error("Failed to get file size.");
//     }

//     // Step 2: Get the upload link from Vimeo
//     const uploadLinkResponse = await axios.post(
//       VIMEO_API_URL,
//       {
//         upload: {
//           approach: "tus",
//           size: size, // Pass the resolved size here
//         },
//         privacy: {
//           view: "anybody",
//           embed: "public",
//         },
//         embed: {
//           color: "#4338CA",
//         },
//       },
//       {
//         headers: {
//           Authorization: `bearer ${VIMEO_ACCESS_TOKEN}`,
//           "Content-Type": "application/json",
//           Accept: "application/vnd.vimeo.*+json;version=3.4",
//         },
//       }
//     );

//     const uploadLink = uploadLinkResponse.data.upload.upload_link;
//     console.log("Upload link:", uploadLink);
//     if (!uploadLink) {
//       throw new Error("Failed to get an upload link from Vimeo");
//     }

//     // Step 3: Read file as base64 (or binary) for uploading
//     const base64Content = await FileSystem.readAsStringAsync(fileUri, {
//       encoding: FileSystem.EncodingType.Base64,
//     });

//     // Step 4: Create a Blob from the base64 content
//     const blob = new Blob([base64Content], { type: "video/mp4" });

//     // Initialize tus client
//     const upload = new tus.Upload(blob, {
//       endpoint: uploadLink, // Use the endpoint from Vimeo's response
//       headers: {
//         Authorization: `Bearer ${VIMEO_ACCESS_TOKEN}`,
//       },
//       chunkSize: 5 * 1024 * 1024, // Set chunk size to 5 MB
//       onError: (error: { message: string | undefined }) => {
//         console.error("Upload failed:", error);
//         Alert.alert("Upload Error", error.message || "Unknown error");
//       },
//       onProgress: (bytesUploaded: number, bytesTotal: number) => {
//         const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
//         console.log(`Uploaded ${percentage}%`);
//       },
//       onSuccess: () => {
//         Alert.alert("Upload Complete", "Video uploaded successfully!");
//       },
//     });

//     upload.start(); // Start the upload process
//   } catch (error) {
//     console.error("Error uploading video:", error);
//     const errorMessage =
//       error instanceof Error ? error.message : "An unknown error occurred";
//     Alert.alert("Error uploading video", errorMessage);
//   }
// };
