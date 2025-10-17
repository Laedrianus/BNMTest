// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// X API Credentials (from environment variables)
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const TWITTER_API_KEY = process.env.TWITTER_API_KEY;
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET;
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
const TWITTER_ACCESS_TOKEN_SECRET = process.env.TWITTER_ACCESS_TOKEN_SECRET;

// Mock data for testing
const mockTweets = [
  {
    id: "1",
    content: "Zero-knowledge proofs validate feed execution and voting correctness without revealing votes or identities. Our latest zkRollup implementation is now live! 🔐",
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    username: "Blocksense",
    handle: "@blocksense_",
    avatar: "B",
    likes: 42,
    retweets: 18,
    url: "https://twitter.com/blocksense_/status/1"
  },
  {
    id: "2",
    content: "Blocksense batches thousands of updates into a single zkRollup block for gas-efficient publishing. Performance improvements up to 85% ⚡",
    created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(), // 35 minutes ago
    username: "Blocksense",
    handle: "@blocksense_",
    avatar: "B",
    likes: 67,
    retweets: 24,
    url: "https://twitter.com/blocksense_/status/2"
  },
  {
    id: "3",
    content: "ZK is also used for compression, consensus, and upcoming zkTLS interactions with the internet. Technical deep dive coming soon! 📚",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    username: "Blocksense",
    handle: "@blocksense_",
    avatar: "B",
    likes: 156,
    retweets: 67,
    url: "https://twitter.com/blocksense_/status/3"
  }
];

// X API Integration Function
async function fetchTweetsFromXAPI(username) {
  try {
    // For demonstration, we're returning mock data
    // In a real implementation, you would use the X API with the credentials
    console.log(`Fetching tweets for ${username} using X API...`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock data for now
    return mockTweets;
    
    /* 
    // Real implementation would look like this:
    const userLookupUrl = `https://api.twitter.com/2/users/by/username/${username}`;
    const userResponse = await fetch(userLookupUrl, {
      headers: {
        'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!userResponse.ok) {
      throw new Error(`User lookup failed: ${userResponse.status}`);
    }

    const userData = await userResponse.json();
    const userId = userData.data.id;

    const tweetsUrl = `https://api.twitter.com/2/users/${userId}/tweets?max_results=10&tweet.fields=created_at,public_metrics,author_id&exclude=retweets,replies`;
    
    const tweetsResponse = await fetch(tweetsUrl, {
      headers: {
        'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!tweetsResponse.ok) {
      throw new Error(`Tweets fetch failed: ${tweetsResponse.status}`);
    }

    const tweetsData = await tweetsResponse.json();
    
    return tweetsData.data.map(tweet => ({
      id: tweet.id,
      content: tweet.text,
      created_at: tweet.created_at,
      username: username === 'blocksense_' ? 'Blocksense' : 'Oracle Pirate',
      handle: `@${username}`,
      avatar: username === 'blocksense_' ? 'B' : 'O',
      likes: tweet.public_metrics?.like_count || 0,
      retweets: tweet.public_metrics?.retweet_count || 0,
      url: `https://twitter.com/${username}/status/${tweet.id}`
    }));
    */
  } catch (error) {
    console.error("X API Error:", error);
    throw error;
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Blocksense Backend Proxy Server Running', 
    endpoints: {
      'GET /api/x/tweets/:username': 'Fetch tweets for a specific user'
    }
  });
});

// X API Proxy Endpoint
app.get('/api/x/tweets/:username', async (req, res) => {
  const { username } = req.params;
  
  // Validate username
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  
  try {
    console.log(`Received request for tweets from ${username}`);
    
    // Fetch tweets from X API
    const tweets = await fetchTweetsFromXAPI(username);
    
    // Return tweets
    res.json(tweets);
  } catch (error) {
    console.error(`Error fetching tweets for ${username}:`, error);
    res.status(500).json({ 
      error: 'Failed to fetch tweets',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Blocksense Backend Proxy Server running on port ${PORT}`);
  console.log(`API Endpoint: http://localhost:${PORT}/api/x/tweets/blocksense_`);
});

module.exports = app;