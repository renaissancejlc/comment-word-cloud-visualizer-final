const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 4000;

// === API Route ===
app.get('/api/comments', async (req, res) => {
  const { videoId } = req.query;
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!videoId) return res.status(400).json({ error: 'Missing videoId' });

  try {
    let comments = [];
    let nextPageToken = '';
    let pageCount = 0;

    while (pageCount < 10) {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/commentThreads`,
        {
          params: {
            part: 'snippet',
            videoId,
            maxResults: 100,
            pageToken: nextPageToken,
            key: apiKey,
          },
        }
      );

      const newComments = response.data.items.map(
        item => item.snippet.topLevelComment.snippet.textDisplay
      );
      comments.push(...newComments);

      nextPageToken = response.data.nextPageToken;
      if (!nextPageToken) break;
      pageCount++;
    }

    const wordCounts = countWords(comments.join(' '));
    const wordCloudData = Object.entries(wordCounts)
      .map(([word, value]) => ({ text: word, value }))
      .slice(0, 50); // Top 50 words

    res.json(wordCloudData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

function countWords(text) {
  const stopwords = new Set([
    'the', 'and', 'you', 'that', 'this', 'with', 'for', 'have', 'not', 'but',
    'are', 'was', 'just', 'like', 'your', 'all', 'get', 'can', 'out', 'what',
    'about', 'who', 'has', 'its', 'would', 'from', 'they', 'one', 'when', 'there'
  ]);
  const words = text
    .replace(/(<([^>]+)>)/gi, '') // Remove HTML tags
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .toLowerCase()
    .split(/\s+/);

  return words.reduce((acc, word) => {
    if (word.length > 2 && !stopwords.has(word)) {
      acc[word] = (acc[word] || 0) + 1;
    }
    return acc;
  }, {});
}

// === Serve Frontend Build ===
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// Handle all other routes → serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// === Start Server ===
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});