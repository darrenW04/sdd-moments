require("dotenv").config();
const CLIENT_ID = "ce2269c67a4d363873de20f02b4a9cf47dc52722";
const CLIENT_SECRET =
  "w2gw6E7aD3ptF2eZY5ASB4y5WeJPx3bzdTFk9yz1uD1W7KPRMRE726YthQnD/zSGkkFZo9efYmm4MbQ6jxHWJNnaj/zwR6BRGhoDpRjU7qdbF/ueIYeeaEAI6kIe48A8";
const VIMEO_ACCESS_TOKEN = "32277fd36fa4e8eb1f850797ffe557aa";
const VIMEO_API_URL = "https://api.vimeo.com/me/videos";
const ACCESS_TOKEN = "32277fd36fa4e8eb1f850797ffe557aa";
let Vimeo = require("vimeo").Vimeo;
let client_vim = new Vimeo(CLIENT_ID, CLIENT_SECRET, ACCESS_TOKEN);
const express = require("express");
const path = require("path");
const { MongoClient, ServerApiVersion } = require("mongodb");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// MongoDB connection setup
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

async function connectToMongoDB() {
  try {
    await client.connect();
    db = client.db("momentsDatabase");
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

// connectToMongoDB();

// Vimeo upload endpoint
app.post("/api/vimeo", async (req, res) => {
  console.log("Uploading video to Vimeo");
  try {
    // Get the file path from the request body
    const file_name = req.body.filePath;

    if (!file_name) {
      return res.status(400).json({ message: "File path is required." });
    }
    console.log("Uploading video to Vimeo:", file_name);
    client_vim.upload(
      file_name,
      {
        name: "testing",
        description: "The description goes here.",
      },
      function (uri) {
        console.log("Your video URI is: " + uri);
        res.status(200).json({ videoUri: uri }); // Send the URI as the response
      },
      function (bytes_uploaded, bytes_total) {
        var percentage = ((bytes_uploaded / bytes_total) * 100).toFixed(2);
        console.log(bytes_uploaded, bytes_total, percentage + "%");
      },
      function (error) {
        console.log("Failed because: " + error);
        res.status(500).json({ message: "Upload failed", error });
      }
    );
  } catch (error) {
    console.error("Error uploading video to Vimeo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//Endpoint to get the profile page informtion
app.get("/api/users/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the current user by ID
    const user = await db.collection("Users").findOne({ user_id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract relevant information
    const userData = {
      username: user.username,
      email: user.email,
      profile_picture: user.profile_picture,
      created_at: user.created_at,
      friend_count: user.friends ? user.friends.length : 0,
    };

    res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to get current user and their friends' details
app.get("/api/users/:userId/friends-details", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the current user by ID
    const user = await db.collection("Users").findOne({ user_id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch details for each friend
    const friendsDetails = await Promise.all(
      user.friends.map(async (friend) => {
        const friendDetails = await db
          .collection("Users")
          .findOne({ user_id: friend.friend_user_id.toString() });
        return {
          userId: friend.friend_user_id,
          name: friendDetails ? friendDetails.username : "Unknown",
          avatar: friendDetails
            ? friendDetails.profile_picture
            : "https://via.placeholder.com/100",
          status: friend.status,
        };
      })
    );

    res.status(200).json({ user, friends: friendsDetails });
  } catch (error) {
    console.error("Error fetching friends details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET endpoint to fetch all videos
app.get("/api/videos", async (req, res) => {
  try {
    const videos = await db.collection("Videos").find().toArray();
    if (videos.length === 0) {
      return res.status(404).json({ message: "No videos found" });
    }

    // Extracting video attributes into separate variables for each video
    const formattedVideos = videos.map((video) => ({
      videoId: video.video_id,
      userId: video.user_id,
      videoUrl: video.video_url,
      title: video.title,
      description: video.description,
      isPublic: video.is_public,
      uploadTime: video.upload_time,
      viewCount: video.view_count,
    }));

    res.status(200).json(formattedVideos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt with email:", email);

  try {
    const user = await db.collection("Users").findOne({ email });
    console.log("User found:", user);

    if (!user) {
      console.log("No user found with this email");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.password !== password) {
      console.log("Password does not match");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log("Login successful");
    // Include user_id in the response
    res
      .status(200)
      .json({ user_id: user.user_id, message: "Login successful" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Sign-up endpoint
app.post("/api/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await db.collection("Users").findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newUser = {
      email,
      password, // Storing password in plain text (not secure, for testing only)
    };

    const result = await db.collection("Users").insertOne(newUser);
    res.status(201).json({
      message: "User registered successfully",
      userId: result.insertedId,
    });
  } catch (error) {
    console.error("Error during sign-up:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Sample route for checking API
app.get("/api", (req, res) => {
  res.send("API is working!");
});

// Catch-all handler for serving React app (if applicable)
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
