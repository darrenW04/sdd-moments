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
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

connectToMongoDB();


app.post("/api/users/:userId/add-friend", async (req, res) => {
  const { userId } = req.params;
  const { friendId } = req.body;

  if (!friendId) {
    return res.status(400).json({ message: "Friend ID is required." });
  }

  try {
    const user = await db.collection("Users").findOne({ user_id: userId });
    const friend = await db.collection("Users").findOne({ user_id: friendId });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!friend) {
      return res.status(404).json({ message: "Friend not found." });
    }

    // Check if already friends
    const isAlreadyFriend = user.friends.some(
      (f) => f.friend_user_id === friendId
    );

    if (isAlreadyFriend) {
      return res.status(400).json({ message: "Already friends." });
    }

    // Add friend to user's friends array
    await db.collection("Users").updateOne(
      { user_id: userId },
      { $push: { friends: { friend_user_id: friendId, status: "accepted" } } }
    );

    res.status(200).json({ message: "Friend added successfully!" });
  } catch (error) {
    console.error("Error adding friend:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});


app.get("/api/users/search", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: "Query parameter is required." });
  }

  try {
    const users = await db
      .collection("Users")
      .find({
        username: { $regex: query, $options: "i" }, // Case-insensitive search
      })
      .project({ user_id: 1, username: 1, _id: 0 }) // Only return user_id and username
      .toArray();

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found." });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});




app.post("/api/users/:userId/remove-friend", async (req, res) => {
  const { userId } = req.params; // This is the current user's ID
  const { friendId } = req.body; // This is the ID of the friend to remove

  console.log(`API Call to remove friend:`);
  console.log(`User ID: ${userId}, Friend ID: ${friendId}`);

  try {
    const result = await db.collection("Users").updateOne(
      { user_id: userId },
      { $pull: { friends: { friend_user_id: friendId } } }
    );

    console.log("Update Result:", result);

    if (result.modifiedCount === 0) {
      console.log("No matching friend found to remove.");
      return res
        .status(404)
        .json({ message: "Friend not found or already removed." });
    }

    console.log("Friend removed successfully.");
    res.status(200).json({ message: "Friend removed successfully." });
  } catch (error) {
    console.error("Error removing friend:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});




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

// Endpoint to fetch a user's friends
app.get("/api/users/:userId/friends", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the current user by ID
    const user = await db.collection("Users").findOne({ user_id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract the friends array from the user document
    const friends = user.friends || [];

    // Fetch details for each friend
    const friendsDetails = await Promise.all(
      friends.map(async (friend) => {
        const friendDetails = await db.collection("Users").findOne({
          user_id: friend.friend_user_id.toString(),
        });

        return {
          userId: friend.friend_user_id,
          name: friendDetails ? friendDetails.username : "Unknown",
        };
      })
    );

    res.status(200).json(friendsDetails);
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update user profile
app.put("/api/users/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { avatar, name, email } = req.body;

    // Validate input
    if (!avatar || !name || !email) {
      return res
        .status(400)
        .json({ message: "All fields (avatar, name, email) are required." });
    }

    // Check if userId is a valid ObjectId
    let query = {};
    if (/^[0-9a-fA-F]{24}$/.test(userId)) {
      query = { _id: new ObjectId(userId) };
    } else {
      query = { user_id: userId }; // Use alternate field if `user_id` is a string in your database
    }

    // Update user in the database
    const updateResult = await db.collection("Users").updateOne(query, {
      $set: {
        profile_picture: avatar,
        username: name,
        email: email,
        updated_at: new Date().toISOString(),
      },
    });

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
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
      friends: user.friends || [],
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
      likes: video.likes,
      comments: video.comments || [], // Include comments if they exist, otherwise default to an empty array
    }));

    res.status(200).json(formattedVideos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Toggle video visibility
app.put("/api/videos/:videoId/toggleVisibility", async (req, res) => {
  try {
    const { videoId } = req.params;

    // Validate if videoId matches your expected format, e.g., MongoDB's ObjectId or a specific string format
    const query = /^[0-9a-fA-F]{24}$/.test(videoId)
      ? { _id: new ObjectId(videoId) }
      : { video_id: videoId }; // Adjust for alternate ID format if necessary

    // Toggle video visibility by inverting the current is_public value
    const updateResult = await db
      .collection("Videos")
      .updateOne(query, [{ $set: { is_public: { $not: "$is_public" } } }]);

    // Check if the video was found and updated
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ message: "Video not found" });
    }
    console.log(updateResult);
    res.status(200).json({ message: "Video visibility toggled successfully" });
  } catch (error) {
    console.error("Error toggling video visibility:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/videos", async (req, res) => {
  try {
    const video = req.body;

    if (!video.user_id || !video.video_url || !video.upload_time) {
      return res.status(400).json({
        message: "Missing required fields: userId, videoUrl, or uploadTime",
      });
    }

    const result = await db.collection("Videos").insertOne(video);

    res.status(201).json({
      message: "Video added successfully",
      videoId: result.insertedId,
    });
  } catch (error) {
    console.error("Error adding video:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// DELETE endpoint to delete a video
app.delete("/api/videos/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      return res.status(400).json({ message: "Video ID is required." });
    }

    const result = await db
      .collection("Videos")
      .deleteOne({ video_id: videoId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Video not found." });
    }

    res.status(200).json({ message: "Video deleted successfully." });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Endpoint to add a comment to a specific video
app.post("/api/videos/comments", async (req, res) => {
  try {
    console.log("Adding comment to video");
    const { videoId, userId, comment } = req.body;
    console.log(videoId, userId, comment);
    if (!videoId || !userId || !comment) {
      return res
        .status(400)
        .json({ message: "videoId, userId, and comment are required." });
    }

    // Push the new comment into the video's comments array
    const result = await db.collection("Videos").updateOne(
      { video_id: videoId },
      {
        $push: {
          comments: {
            userId,
            comment,
          },
        },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Video not found." });
    }

    res.status(200).json({
      message: "Comment added successfully",
      comment: {
        userId,
        comment,
      },
    });
  } catch (error) {
    console.error("Error adding comment:", error);
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
