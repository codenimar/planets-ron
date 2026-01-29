// X.com (Twitter) API Helper
// Provides utilities for interacting with the X API v2

/**
 * Configuration for X API
 * These should be set as environment variables in Vercel
 */
const X_API_BEARER_TOKEN = process.env.X_API_BEARER_TOKEN || '';

/**
 * Base URL for X API v2
 */
const X_API_BASE_URL = 'https://api.twitter.com/2';

/**
 * Makes an authenticated request to the X API
 */
export async function makeXAPIRequest(endpoint: string): Promise<any> {
  if (!X_API_BEARER_TOKEN) {
    throw new Error('X API Bearer Token not configured');
  }

  const url = `${X_API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${X_API_BEARER_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`X API Error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  return await response.json();
}

/**
 * Extract the X user ID from a profile URL or username
 * For a full implementation, you'd need to call the X API to get user ID from username
 */
export function extractTwitterUserId(postUrl: string): string | null {
  // Extract username from URL like https://x.com/username/status/123456
  const match = postUrl.match(/(?:twitter\.com|x\.com)\/([^\/]+)/);
  if (match) {
    return match[1]; // Returns username (would need to be converted to ID via API)
  }
  return null;
}

/**
 * Extract the tweet ID from a post URL
 */
export function extractTweetId(postUrl: string): string | null {
  const match = postUrl.match(/status\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Check if a user follows a target user
 * Uses X API v2 endpoint: GET /2/users/:id/following
 */
export async function checkFollowing(userId: string, targetUserId: string): Promise<boolean> {
  try {
    // Get the list of users that userId is following
    const endpoint = `/users/${userId}/following?max_results=1000`;
    const data = await makeXAPIRequest(endpoint);
    
    // Check if targetUserId is in the list of following
    if (data.data && Array.isArray(data.data)) {
      return data.data.some((user: any) => user.id === targetUserId);
    }
    
    return false;
  } catch (error) {
    console.error('Error checking following status:', error);
    throw error;
  }
}

/**
 * Check if a user has liked a specific tweet
 * Uses X API v2 endpoint: GET /2/users/:id/liked_tweets
 */
export async function checkLiked(userId: string, tweetId: string): Promise<boolean> {
  try {
    // Get the list of tweets that userId has liked
    const endpoint = `/users/${userId}/liked_tweets?max_results=100`;
    const data = await makeXAPIRequest(endpoint);
    
    // Check if tweetId is in the list of liked tweets
    if (data.data && Array.isArray(data.data)) {
      return data.data.some((tweet: any) => tweet.id === tweetId);
    }
    
    return false;
  } catch (error) {
    console.error('Error checking liked status:', error);
    throw error;
  }
}

/**
 * Check if a user has retweeted a specific tweet
 * Uses X API v2 endpoint: GET /2/tweets/:id/retweeted_by
 * Alternative: GET /2/users/:id/tweets and check for retweets
 */
export async function checkRetweeted(userId: string, tweetId: string): Promise<boolean> {
  try {
    // Method 1: Check who retweeted the tweet
    const endpoint = `/tweets/${tweetId}/retweeted_by?max_results=100`;
    const data = await makeXAPIRequest(endpoint);
    
    // Check if userId is in the list of users who retweeted
    if (data.data && Array.isArray(data.data)) {
      return data.data.some((user: any) => user.id === userId);
    }
    
    return false;
  } catch (error) {
    console.error('Error checking retweet status:', error);
    throw error;
  }
}

/**
 * Get user ID from username using X API
 * Uses X API v2 endpoint: GET /2/users/by/username/:username
 */
export async function getUserIdFromUsername(username: string): Promise<string> {
  try {
    // Remove @ if present
    const cleanUsername = username.replace('@', '');
    const endpoint = `/users/by/username/${cleanUsername}`;
    const data = await makeXAPIRequest(endpoint);
    
    if (data.data && data.data.id) {
      return data.data.id;
    }
    
    throw new Error(`User not found: ${username}`);
  } catch (error) {
    console.error('Error getting user ID:', error);
    throw error;
  }
}
