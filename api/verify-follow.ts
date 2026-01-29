// Vercel Serverless Function: Verify Follow Action
// Endpoint: /api/verify-follow
// Method: POST
// Body: { xHandle: string, postUrl: string }

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserIdFromUsername, extractTwitterUserId, extractTweetId, checkFollowing } from './x-api-helper';

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

    // Extract the target username from the post URL
    const targetUsername = extractTwitterUserId(postUrl);
    if (!targetUsername) {
      return res.status(400).json({ 
        success: false,
        error: 'Could not extract username from post URL' 
      });
    }

    // Get the target user ID
    const targetUserId = await getUserIdFromUsername(targetUsername);

    // Check if the user follows the target
    const isFollowing = await checkFollowing(userId, targetUserId);

    return res.status(200).json({
      success: true,
      verified: isFollowing,
      message: isFollowing 
        ? 'Follow action verified successfully' 
        : 'User is not following the target account',
    });
  } catch (error: any) {
    console.error('Error verifying follow:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to verify follow action',
    });
  }
}
