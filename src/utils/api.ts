// API base URL configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth.php?action=login`,
  LOGOUT: `${API_BASE_URL}/auth.php?action=logout`,
  CHECK_SESSION: `${API_BASE_URL}/auth.php?action=check_session`,
  
  // Members
  MEMBER_PROFILE: `${API_BASE_URL}/members.php?action=profile`,
  MEMBER_STATS: `${API_BASE_URL}/members.php?action=stats`,
  MEMBER_PASSES: `${API_BASE_URL}/members.php?action=passes`,
  
  // Posts
  POSTS_LIST: `${API_BASE_URL}/posts.php?action=list`,
  POST_VIEW: `${API_BASE_URL}/posts.php?action=view`,
  POST_CREATE: `${API_BASE_URL}/posts.php?action=create`,
  POST_UPDATE: `${API_BASE_URL}/posts.php?action=update`,
  MY_POSTS: `${API_BASE_URL}/posts.php?action=my_posts`,
  
  // Rewards
  REWARDS_LIST: `${API_BASE_URL}/rewards.php?action=list`,
  REWARD_CLAIM: `${API_BASE_URL}/rewards.php?action=claim`,
  MY_CLAIMS: `${API_BASE_URL}/rewards.php?action=my_claims`,
  
  // NFTs
  NFT_COLLECTIONS: `${API_BASE_URL}/nfts.php?action=collections`,
  MY_NFTS: `${API_BASE_URL}/nfts.php?action=my_nfts`,
};

// Helper function to make authenticated API calls
export const apiCall = async (url: string, options: RequestInit = {}) => {
  const defaultOptions: RequestInit = {
    credentials: 'include', // Include cookies for session
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Authentication helper
export const checkAuth = async () => {
  try {
    const response = await apiCall(API_ENDPOINTS.CHECK_SESSION);
    return response.authenticated || false;
  } catch (error) {
    return false;
  }
};
