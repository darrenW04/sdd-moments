require('dotenv').config();
const express = require('express');
const path = require('path');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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


// Update user profile
app.put('/api/users/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { avatar, name, email } = req.body;

    // Validate input
    if (!avatar || !name || !email) {
      return res.status(400).json({ message: 'All fields (avatar, name, email) are required.' });
    }

    // Check if userId is a valid ObjectId
    let query = {};
    if (/^[0-9a-fA-F]{24}$/.test(userId)) {
      query = { _id: new ObjectId(userId) };
    } else {
      query = { user_id: userId }; // Use alternate field if `user_id` is a string in your database
    }

    // Update user in the database
    const updateResult = await db.collection('Users').updateOne(
      query,
      {
        $set: {
          profile_picture: avatar,
          username: name,
          email: email,
          updated_at: new Date().toISOString(),
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



//Endpoint to get the profile page informtion
app.get('/api/users/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the current user by ID
    const user = await db.collection('Users').findOne({ user_id: userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
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
    console.error('Error fetching user info:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Endpoint to get current user and their friends' details
app.get('/api/users/:userId/friends-details', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the current user by ID
    const user = await db.collection('Users').findOne({ user_id: userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch details for each friend
    const friendsDetails = await Promise.all(
      user.friends.map(async (friend) => {
        const friendDetails = await db.collection('Users').findOne({ user_id: friend.friend_user_id.toString() });
        return {
          userId: friend.friend_user_id,
          name: friendDetails ? friendDetails.username : 'Unknown',
          avatar: friendDetails ? friendDetails.profile_picture : 'https://via.placeholder.com/100',
          status: friend.status,
        };
      })
    );

    res.status(200).json({ user, friends: friendsDetails });
  } catch (error) {
    console.error('Error fetching friends details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


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
      // Include user_id in the response
      res.status(200).json({ user_id: user.user_id, message: 'Login successful' });
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
