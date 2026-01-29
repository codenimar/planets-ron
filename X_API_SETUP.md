# X.com (Twitter) API Integration Setup

This document explains how to set up the X.com API integration for verifying follow, like, and retweet actions.

## Overview

The application uses X.com (Twitter) API v2 to verify that users have actually completed the required actions (follow, like, retweet) on X.com before awarding points. This prevents users from claiming points without actually performing the actions.

## Prerequisites

1. A Twitter Developer Account
2. Access to X API v2 (Basic tier or higher)
3. A Bearer Token for authentication

## Setup Instructions

### 1. Create a Twitter Developer Account

1. Go to [https://developer.twitter.com/](https://developer.twitter.com/)
2. Sign up for a developer account
3. Apply for access (usually approved within a few hours)

### 2. Create an App

1. Once approved, go to the [Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new Project and App
3. Save your API Keys and Bearer Token

### 3. Configure Environment Variables

For local development, create a `.env` file in the root directory:

```bash
# X.com (Twitter) API Configuration
X_API_BEARER_TOKEN=your_bearer_token_here
```

For Vercel deployment:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add `X_API_BEARER_TOKEN` with your Bearer Token value
4. Set it for all environments (Production, Preview, Development)

### 4. API Permissions Required

Your X API app needs the following permissions:
- **Read**: To read user following lists, liked tweets, and retweets
- **Tweet.Read**: To check if tweets are liked
- **Users.Read**: To get user information
- **Follows.Read**: To check following relationships

### 5. Rate Limits

X API v2 has rate limits:
- **Basic Tier**: 300 requests per 15 minutes per endpoint
- Consider implementing caching if you have high traffic

## API Endpoints

The application uses three serverless functions to verify actions:

### `/api/verify-follow`
Checks if a user follows a target account using:
- `GET /2/users/:id/following`

### `/api/verify-like`
Checks if a user has liked a specific tweet using:
- `GET /2/users/:id/liked_tweets`

### `/api/verify-retweet`
Checks if a user has retweeted a specific tweet using:
- `GET /2/tweets/:id/retweeted_by`

## Testing

To test the integration:

1. Set up your Bearer Token as described above
2. Deploy to Vercel or run locally
3. Add an X post in the admin panel
4. Complete the actions on X.com (follow, like, retweet)
5. Click the verify buttons on the dashboard
6. Check the browser console and API logs for any errors

## Troubleshooting

### Common Issues

1. **"X API Bearer Token not configured"**
   - Make sure the environment variable is set correctly
   - Restart your development server or redeploy to Vercel

2. **"User not found"**
   - Check that the X handle in the user profile is correct
   - Make sure it doesn't include the @ symbol

3. **Rate Limit Errors**
   - Wait 15 minutes for the rate limit to reset
   - Consider implementing caching or request throttling

4. **Verification Fails but Action Was Completed**
   - The X API may have a delay in updating
   - Wait a few seconds and try again
   - Check that you're logged into X.com with the correct account

5. **Follow Verification Fails for Users Following 1000+ Accounts**
   - The current implementation checks the first 1000 followed accounts
   - If the target account is not in the first 1000, verification will fail
   - Consider implementing pagination in the checkFollowing function

6. **Like/Retweet Verification Fails for Old Tweets**
   - The current implementation checks recent likes (100 most recent) and retweets
   - If the tweet is not in the recent results, verification will fail
   - Consider implementing pagination or increasing the result limit

## Backwards Compatibility

The system is designed to be backwards compatible:
- If the X API is not configured or fails, users can still complete actions
- The verification will be skipped, and points will still be awarded
- This ensures the application continues to work even if the API is down

## Security Notes

- Never commit your Bearer Token to the repository
- Use environment variables for all API credentials
- The Bearer Token should be kept secret and rotated regularly
- Consider using Vercel's encrypted environment variables for production

## Cost

- X API Basic tier is **free** with rate limits
- For higher limits, consider upgrading to Pro or Enterprise tiers
- Monitor your API usage in the Twitter Developer Portal

## Support

For issues with X API:
- Check the [Twitter API Documentation](https://developer.twitter.com/en/docs/twitter-api)
- Visit the [Twitter Developer Forums](https://twittercommunity.com/)
- Review the API status at [Twitter API Status](https://api.twitterstat.us/)
