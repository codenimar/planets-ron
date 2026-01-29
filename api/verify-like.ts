// Vercel Serverless Function: Verify Like Action
// Endpoint: /api/verify-like
// Method: POST
// Body: { xHandle: string, postUrl: string }

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserIdFromUsername, extractTweetId, checkLiked } from './x-api-helper';

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
        error: 'Could not extract tweet ID from post URL' 
      });
    }

    // Check if the user has liked the tweet
    const isLiked = await checkLiked(userId, tweetId);

    return res.status(200).json({
      success: true,
      verified: isLiked,
      message: isLiked 
        ? 'Like action verified successfully' 
        : 'User has not liked the tweet',
    });
  } catch (error: any) {
    console.error('Error verifying like:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to verify like action',
    });
  }
}
