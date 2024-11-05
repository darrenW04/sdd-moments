require('dotenv').config();
const express = require('express');
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser');

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
  }
});

let db;

async function connectToMongoDB() {
  try {
    await client.connect();
    db = client.db('momentsDatabase'); 
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

connectToMongoDB();

// GET endpoint to fetch all videos
app.get('/api/videos', async (req, res) => {
    try {
      const videos = await db.collection('Videos').find().toArray();
      if (videos.length === 0) {
        return res.status(404).json({ message: 'No videos found' });
      }
  
      // Extracting video attributes into separate variables for each video
      const formattedVideos = videos.map(video => ({
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
      res.status(500).json({ message: 'Internal server error' });
    }
  });

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt with email:', email);
  
    try {
      const user = await db.collection('Users').findOne({ email });
      console.log('User found:', user);
  
      if (!user) {
        console.log('No user found with this email');
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      if (user.password !== password) {
        console.log('Password does not match');
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      console.log('Login successful');
      res.status(200).json({ message: 'Login successful' });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

// Sign-up endpoint
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await db.collection('Users').findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const newUser = {
      email,
      password, // Storing password in plain text (not secure, for testing only)
    };

    const result = await db.collection('Users').insertOne(newUser);
    res.status(201).json({ message: 'User registered successfully', userId: result.insertedId });
  } catch (error) {
    console.error("Error during sign-up:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Sample route for checking API
app.get('/api', (req, res) => {
  res.send("API is working!");
});

// Catch-all handler for serving React app (if applicable)
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
