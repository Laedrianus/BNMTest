// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

// Admin Panel Functions
// Get existing calls from script.js
async function getExistingCalls() {
  try {
    const scriptPath = path.join(__dirname, '..', 'script.js');
    const htmlPath = path.join(__dirname, '..', 'community-calls.html');
    
    const scriptContent = await fs.readFile(scriptPath, 'utf8');
    const htmlContent = await fs.readFile(htmlPath, 'utf8');
    
    // Parse callDates from script.js
    const callDatesRegex = /const callDates = \[([\s\S]*?)\];/;
    const datesMatch = scriptContent.match(callDatesRegex);
    
    // Parse youtubeLinks from community-calls.html
    const youtubeLinksRegex = /const youtubeLinks = \[([\s\S]*?)\];/;
    const linksMatch = htmlContent.match(youtubeLinksRegex);
    
    if (datesMatch && linksMatch) {
      const datesArray = datesMatch[1];
      const linksArray = linksMatch[1];
      
      const dates = datesArray.split('\n').map(line => line.trim().replace(/[",]/g, '')).filter(line => line);
      const links = linksArray.split('\n').map(line => line.trim().replace(/[",]/g, '')).filter(line => line);
      
      return dates.map((date, index) => ({
        callNumber: index + 1,
        callDate: date,
        youtubeLink: links[index] || '',
        hasTranscript: true
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error getting existing calls:', error);
    return [];
  }
}

async function updateScriptJs(callNumber, callDate, isUpdate = false) {
  try {
    const scriptPath = path.join(__dirname, '..', 'script.js');
    const scriptContent = await fs.readFile(scriptPath, 'utf8');
    
    // Find the callDates array and update it
    const callDatesRegex = /const callDates = \[([\s\S]*?)\];/;
    const match = scriptContent.match(callDatesRegex);
    
    if (match) {
      const datesArray = match[1];
      const dates = datesArray.split('\n').map(line => line.trim().replace(/[",]/g, '')).filter(line => line);
      
      const insertIndex = callNumber - 1;
      
      if (isUpdate) {
        // Update existing entry
        if (insertIndex < dates.length) {
          dates[insertIndex] = callDate;
        } else {
          dates.push(callDate);
        }
      } else {
        // Insert new entry
        dates.splice(insertIndex, 0, callDate);
      }
      
      // Rebuild the array
      const newDatesArray = dates.map(date => `        "${date}"`).join(',\n');
      const newCallDates = `const callDates = [\n${newDatesArray}\n    ];`;
      
      // Replace in the script content
      const updatedScript = scriptContent.replace(callDatesRegex, newCallDates);
      
      await fs.writeFile(scriptPath, updatedScript, 'utf8');
      console.log(`Updated script.js with call date: ${callDate}`);
    }
  } catch (error) {
    console.error('Error updating script.js:', error);
    throw error;
  }
}

async function removeFromScriptJs(callNumber) {
  try {
    const scriptPath = path.join(__dirname, '..', 'script.js');
    const scriptContent = await fs.readFile(scriptPath, 'utf8');
    
    const callDatesRegex = /const callDates = \[([\s\S]*?)\];/;
    const match = scriptContent.match(callDatesRegex);
    
    if (match) {
      const datesArray = match[1];
      const dates = datesArray.split('\n').map(line => line.trim().replace(/[",]/g, '')).filter(line => line);
      
      // Remove the entry at the specified index
      const removeIndex = callNumber - 1;
      if (removeIndex >= 0 && removeIndex < dates.length) {
        dates.splice(removeIndex, 1);
        
        // Rebuild the array
        const newDatesArray = dates.map(date => `        "${date}"`).join(',\n');
        const newCallDates = `const callDates = [\n${newDatesArray}\n    ];`;
        
        // Replace in the script content
        const updatedScript = scriptContent.replace(callDatesRegex, newCallDates);
        
        await fs.writeFile(scriptPath, updatedScript, 'utf8');
        console.log(`Removed call ${callNumber} from script.js`);
      }
    }
  } catch (error) {
    console.error('Error removing from script.js:', error);
    throw error;
  }
}

async function updateCommunityCallsHtml(callNumber, youtubeLink, isUpdate = false) {
  try {
    const htmlPath = path.join(__dirname, '..', 'community-calls.html');
    const htmlContent = await fs.readFile(htmlPath, 'utf8');
    
    // Find the youtubeLinks array and update it
    const youtubeLinksRegex = /const youtubeLinks = \[([\s\S]*?)\];/;
    const match = htmlContent.match(youtubeLinksRegex);
    
    if (match) {
      const linksArray = match[1];
      const links = linksArray.split('\n').map(line => line.trim().replace(/[",]/g, '')).filter(line => line);
      
      const insertIndex = callNumber - 1;
      
      if (isUpdate) {
        // Update existing entry
        if (insertIndex < links.length) {
          links[insertIndex] = youtubeLink;
        } else {
          links.push(youtubeLink);
        }
      } else {
        // Insert new entry
        links.splice(insertIndex, 0, youtubeLink);
      }
      
      // Rebuild the array
      const newLinksArray = links.map(link => `            "${link}"`).join(',\n');
      const newYoutubeLinks = `        const youtubeLinks = [\n${newLinksArray}\n        ];`;
      
      // Replace in the HTML content
      const updatedHtml = htmlContent.replace(youtubeLinksRegex, newYoutubeLinks);
      
      await fs.writeFile(htmlPath, updatedHtml, 'utf8');
      console.log(`Updated community-calls.html with YouTube link: ${youtubeLink}`);
    }
  } catch (error) {
    console.error('Error updating community-calls.html:', error);
    throw error;
  }
}

async function removeFromCommunityCallsHtml(callNumber) {
  try {
    const htmlPath = path.join(__dirname, '..', 'community-calls.html');
    const htmlContent = await fs.readFile(htmlPath, 'utf8');
    
    const youtubeLinksRegex = /const youtubeLinks = \[([\s\S]*?)\];/;
    const match = htmlContent.match(youtubeLinksRegex);
    
    if (match) {
      const linksArray = match[1];
      const links = linksArray.split('\n').map(line => line.trim().replace(/[",]/g, '')).filter(line => line);
      
      // Remove the entry at the specified index
      const removeIndex = callNumber - 1;
      if (removeIndex >= 0 && removeIndex < links.length) {
        links.splice(removeIndex, 1);
        
        // Rebuild the array
        const newLinksArray = links.map(link => `            "${link}"`).join(',\n');
        const newYoutubeLinks = `        const youtubeLinks = [\n${newLinksArray}\n        ];`;
        
        // Replace in the HTML content
        const updatedHtml = htmlContent.replace(youtubeLinksRegex, newYoutubeLinks);
        
        await fs.writeFile(htmlPath, updatedHtml, 'utf8');
        console.log(`Removed call ${callNumber} from community-calls.html`);
      }
    }
  } catch (error) {
    console.error('Error removing from community-calls.html:', error);
    throw error;
  }
}

async function saveTranscriptFiles(callNumber, englishTranscript, turkishTranscript) {
  try {
    const transcriptsDir = path.join(__dirname, '..', 'transcripts');
    const engDir = path.join(transcriptsDir, 'ENG');
    const trDir = path.join(transcriptsDir, 'TR');
    
    // Ensure directories exist
    await fs.mkdir(engDir, { recursive: true });
    await fs.mkdir(trDir, { recursive: true });
    
    // Save English transcript
    const engFilePath = path.join(engDir, `call-${callNumber}.txt`);
    await fs.writeFile(engFilePath, englishTranscript, 'utf8');
    
    // Save Turkish transcript
    const trFilePath = path.join(trDir, `call-${callNumber}.txt`);
    await fs.writeFile(trFilePath, turkishTranscript, 'utf8');
    
    console.log(`Saved transcript files for call ${callNumber}`);
  } catch (error) {
    console.error('Error saving transcript files:', error);
    throw error;
  }
}

async function deleteTranscriptFiles(callNumber) {
  try {
    const transcriptsDir = path.join(__dirname, '..', 'transcripts');
    const engDir = path.join(transcriptsDir, 'ENG');
    const trDir = path.join(transcriptsDir, 'TR');
    
    const engFilePath = path.join(engDir, `call-${callNumber}.txt`);
    const trFilePath = path.join(trDir, `call-${callNumber}.txt`);
    
    // Delete English transcript
    try {
      await fs.unlink(engFilePath);
      console.log(`Deleted English transcript: ${engFilePath}`);
    } catch (error) {
      console.log(`English transcript file not found: ${engFilePath}`);
    }
    
    // Delete Turkish transcript
    try {
      await fs.unlink(trFilePath);
      console.log(`Deleted Turkish transcript: ${trFilePath}`);
    } catch (error) {
      console.log(`Turkish transcript file not found: ${trFilePath}`);
    }
    
    console.log(`Deleted transcript files for call ${callNumber}`);
  } catch (error) {
    console.error('Error deleting transcript files:', error);
    throw error;
  }
}

async function commitAndPushChanges(callNumber, callDate, isUpdate = false, isDelete = false) {
  try {
    const repoPath = path.join(__dirname, '..');
    
    // Change to repository directory
    process.chdir(repoPath);
    
    // Add all changes
    execSync('git add .', { stdio: 'inherit' });
    
    // Create appropriate commit message
    let commitMessage;
    if (isDelete) {
      commitMessage = `Delete Community Call ${callNumber}`;
    } else if (isUpdate) {
      commitMessage = `Update Community Call ${callNumber} - ${callDate}`;
    } else {
      commitMessage = `Add Community Call ${callNumber} - ${callDate}`;
    }
    
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    
    // Push changes
    execSync('git push', { stdio: 'inherit' });
    
    console.log(`Successfully committed and pushed changes for Call ${callNumber}`);
  } catch (error) {
    console.error('Error committing and pushing changes:', error);
    throw error;
  }
}

// Admin Panel API Endpoints

// Get existing calls
app.get('/api/admin/get-calls', async (req, res) => {
  try {
    const calls = await getExistingCalls();
    res.json(calls);
  } catch (error) {
    console.error('Error getting calls:', error);
    res.status(500).json({ 
      error: 'Failed to get calls',
      message: error.message 
    });
  }
});

// Add new call
app.post('/api/admin/add-call', async (req, res) => {
  try {
    const { callNumber, callDate, youtubeLink, englishTranscript, turkishTranscript } = req.body;
    
    // Validate required fields
    if (!callNumber || !callDate || !youtubeLink) {
      return res.status(400).json({ error: 'Call number, date, and YouTube link are required' });
    }
    
    // Transcripts are required for new calls
    if (!englishTranscript || !turkishTranscript) {
      return res.status(400).json({ error: 'Transcript files are required for new calls' });
    }
    
    console.log(`Processing admin request for Call ${callNumber}`);
    
    // Update script.js
    await updateScriptJs(callNumber, callDate);
    
    // Update community-calls.html
    await updateCommunityCallsHtml(callNumber, youtubeLink);
    
    // Save transcript files
    await saveTranscriptFiles(callNumber, englishTranscript.content, turkishTranscript.content);
    
    // Commit and push changes
    await commitAndPushChanges(callNumber, callDate);
    
    res.json({ 
      success: true, 
      message: `Community Call ${callNumber} added successfully!`,
      callNumber,
      callDate,
      youtubeLink
    });
    
  } catch (error) {
    console.error('Admin API Error:', error);
    res.status(500).json({ 
      error: 'Failed to add community call',
      message: error.message 
    });
  }
});

// Update existing call
app.post('/api/admin/update-call', async (req, res) => {
  try {
    const { callNumber, callDate, youtubeLink, englishTranscript, turkishTranscript } = req.body;
    
    // Validate required fields
    if (!callNumber || !callDate || !youtubeLink) {
      return res.status(400).json({ error: 'Call number, date, and YouTube link are required' });
    }
    
    console.log(`Processing update request for Call ${callNumber}`);
    
    // Update script.js
    await updateScriptJs(callNumber, callDate, true); // true for update mode
    
    // Update community-calls.html
    await updateCommunityCallsHtml(callNumber, youtubeLink, true); // true for update mode
    
    // Save transcript files only if provided
    if (englishTranscript && turkishTranscript) {
      await saveTranscriptFiles(callNumber, englishTranscript.content, turkishTranscript.content);
    }
    
    // Commit and push changes
    await commitAndPushChanges(callNumber, callDate, true); // true for update mode
    
    res.json({ 
      success: true, 
      message: `Community Call ${callNumber} updated successfully!`,
      callNumber,
      callDate,
      youtubeLink
    });
    
  } catch (error) {
    console.error('Update API Error:', error);
    res.status(500).json({ 
      error: 'Failed to update community call',
      message: error.message 
    });
  }
});

// Delete call
app.post('/api/admin/delete-call', async (req, res) => {
  try {
    const { callNumber } = req.body;
    
    if (!callNumber) {
      return res.status(400).json({ error: 'Call number is required' });
    }
    
    console.log(`Processing delete request for Call ${callNumber}`);
    
    // Remove from script.js
    await removeFromScriptJs(callNumber);
    
    // Remove from community-calls.html
    await removeFromCommunityCallsHtml(callNumber);
    
    // Delete transcript files
    await deleteTranscriptFiles(callNumber);
    
    // Commit and push changes
    await commitAndPushChanges(callNumber, null, false, true); // true for delete mode
    
    res.json({ 
      success: true, 
      message: `Community Call ${callNumber} deleted successfully!`
    });
    
  } catch (error) {
    console.error('Delete API Error:', error);
    res.status(500).json({ 
      error: 'Failed to delete community call',
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
  console.log(`Admin API: http://localhost:${PORT}/api/admin/add-call`);
});

module.exports = app;