// Vercel Serverless Function: Verify Retweet Action
// Endpoint: /api/verify-retweet
// Method: POST
// Body: { xHandle: string, postUrl: string }

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserIdFromUsername, extractTweetId, checkRetweeted } from './x-api-helper';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { xHandle, postUrl } = req.body;

    // Validate inputs
    if (!xHandle || !postUrl) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required parameters: xHandle and postUrl' 
      });
    }

    // Get the user ID for the member
    const userId = await getUserIdFromUsername(xHandle);

    // Extract the tweet ID from the post URL
    const tweetId = extractTweetId(postUrl);
    if (!tweetId) {
      return res.status(400).json({ 
        success: false,
        error: 'Could not extract tweet ID from post URL. Please ensure the URL is a valid X.com post URL.' 
      });
    }

    // Check if the user has retweeted the tweet
    const isRetweeted = await checkRetweeted(userId, tweetId);

    return res.status(200).json({
      success: true,
      verified: isRetweeted,
      message: isRetweeted 
        ? 'Retweet action verified successfully' 
        : `User @${xHandle} has not retweeted this tweet. Please retweet the post on X.com first.`,
    });
  } catch (error: any) {
    console.error('Error verifying retweet:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to verify retweet action',
    });
  }
}
