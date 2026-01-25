# RoninAds.com API Documentation

Complete PHP backend API for the RoninAds advertising service.

## Setup

### Prerequisites
- PHP 7.4 or higher
- MySQL 5.7 or higher
- PDO PHP extension

### Installation

1. **Configure Database**
   
   Copy `.env.example` to `.env` and update database credentials:
   ```env
   DB_HOST=localhost
   DB_NAME=roninads
   DB_USER=your_username
   DB_PASS=your_password
   ```

2. **Initialize Database**
   
   Run the schema file to create all tables:
   ```bash
   mysql -u your_username -p roninads < database/schema.sql
   ```

3. **Configure CORS**
   
   Update allowed origins in `public/api/config.php` for production:
   ```php
   $allowedOrigins = [
       'https://yourdomain.com',
   ];
   ```

## API Endpoints

### Authentication (`/api/auth.php`)

#### Login
```
POST /api/auth.php?action=login
Body: {
  "address": "0x...",
  "walletType": "ronin|metamask|waypoint"
}
Response: {
  "success": true,
  "data": {
    "member": {...},
    "sessionToken": "...",
    "csrfToken": "..."
  }
}
```

#### Logout
```
POST /api/auth.php?action=logout
Response: {
  "success": true,
  "message": "Logout successful"
}
```

#### Check Session
```
GET /api/auth.php?action=check-session
Response: {
  "success": true,
  "authenticated": true,
  "data": { "member": {...} }
}
```

---

### Members Management (`/api/members.php`)

All endpoints require authentication.

#### Get Profile
```
GET /api/members.php?action=profile
Response: {
  "success": true,
  "data": {
    "member": {...},
    "clickPass": {...},
    "publisherPass": {...},
    "nfts": [...],
    "nftBonusPoints": 10
  }
}
```

#### Get Stats
```
GET /api/members.php?action=stats
Response: {
  "success": true,
  "data": {
    "stats": {...},
    "recentHistory": [...]
  }
}
```

#### Update Points (Admin Only)
```
POST /api/members.php?action=update-points
Body: {
  "memberId": 1,
  "pointsChange": 100,
  "reason": "Bonus reward"
}
```

#### Get Passes
```
GET /api/members.php?action=passes
Response: {
  "success": true,
  "data": {
    "clickPasses": [...],
    "publisherPasses": [...]
  }
}
```

---

### Posts/Ads Management (`/api/posts.php`)

#### List Posts
```
GET /api/posts.php?action=list&page=1&limit=20&type=ad
Response: {
  "success": true,
  "data": {
    "posts": [...],
    "pagination": {...}
  }
}
```

#### Get Single Post
```
GET /api/posts.php?action=get&id=1
Response: {
  "success": true,
  "data": {
    "id": 1,
    "title": "...",
    "view_count": 100,
    ...
  }
}
```

#### Create Post (Requires Publisher Pass)
```
POST /api/posts.php?action=create
Body: {
  "title": "Ad Title",
  "content": "Ad content...",
  "postType": "ad|post|announcement"
}
Response: {
  "success": true,
  "message": "Post created successfully and pending approval",
  "data": {...}
}
```

#### Update Post
```
PUT /api/posts.php?action=update
Body: {
  "id": 1,
  "title": "Updated Title",
  "content": "Updated content..."
}
```

#### Delete Post
```
DELETE /api/posts.php?action=delete&id=1
```

#### Approve Post (Admin Only)
```
POST /api/posts.php?action=approve
Body: {
  "id": 1,
  "approved": true
}
```

#### View Post (Earn Points)
```
POST /api/posts.php?action=view
Body: {
  "postId": 1,
  "duration": 15
}
Response: {
  "success": true,
  "data": {
    "pointsEarned": 11,
    "alreadyViewed": false
  }
}
```

#### Get My Posts
```
GET /api/posts.php?action=my-posts
Response: {
  "success": true,
  "data": [...]
}
```

#### Get Post Statistics
```
GET /api/posts.php?action=stats&id=1
Response: {
  "success": true,
  "data": {
    "stats": {...},
    "viewsByDate": [...]
  }
}
```

---

### Rewards Management (`/api/rewards.php`)

#### List Rewards
```
GET /api/rewards.php?action=list&type=nft
Response: {
  "success": true,
  "data": [...]
}
```

#### Get Reward
```
GET /api/rewards.php?action=get&id=1
Response: {
  "success": true,
  "data": {...}
}
```

#### Claim Reward
```
POST /api/rewards.php?action=claim
Body: {
  "rewardId": 1
}
Response: {
  "success": true,
  "message": "Reward claimed successfully",
  "data": {
    "claim": {...},
    "reward": {...}
  }
}
```

#### Get My Claims
```
GET /api/rewards.php?action=my-claims
Response: {
  "success": true,
  "data": [...]
}
```

#### Get All Claims (Admin Only)
```
GET /api/rewards.php?action=all-claims&status=pending&page=1&limit=50
Response: {
  "success": true,
  "data": {
    "claims": [...],
    "pagination": {...}
  }
}
```

#### Process Claim (Admin Only)
```
POST /api/rewards.php?action=process-claim
Body: {
  "claimId": 1,
  "status": "sent|cancelled",
  "transactionHash": "0x..."
}
```

#### Create Reward (Admin Only)
```
POST /api/rewards.php?action=create
Body: {
  "name": "Reward Name",
  "type": "nft|token",
  "points": 1000,
  "quantity": 100,
  "description": "Description..."
}
```

#### Update Reward (Admin Only)
```
PUT /api/rewards.php?action=update
Body: {
  "id": 1,
  "name": "Updated Name",
  "points": 1500,
  "quantity": 50,
  "isActive": true
}
```

---

### NFT Collection Tracking (`/api/nfts.php`)

#### List Collections
```
GET /api/nfts.php?action=collections
Response: {
  "success": true,
  "data": [...]
}
```

#### Get My NFTs
```
GET /api/nfts.php?action=my-nfts
Response: {
  "success": true,
  "data": {
    "nfts": [...],
    "totalBonus": 15
  }
}
```

#### Update Holdings
```
POST /api/nfts.php?action=update-holdings
Body: {
  "collectionId": 1,
  "nftCount": 5
}
```

#### Add Collection (Admin Only)
```
POST /api/nfts.php?action=add-collection
Body: {
  "name": "Collection Name",
  "address": "0x...",
  "pointsPerNft": 1,
  "maxNfts": 3
}
```

#### Update Collection (Admin Only)
```
PUT /api/nfts.php?action=update-collection
Body: {
  "id": 1,
  "name": "Updated Name",
  "pointsPerNft": 2,
  "maxNfts": 5,
  "isActive": true
}
```

#### Verify Holdings (Placeholder)
```
POST /api/nfts.php?action=verify-holdings
Body: {
  "collectionId": 1
}
Note: Blockchain verification not yet implemented
```

---

## Business Logic

### Points System

**Base Points:**
- 1 point for viewing a post for 10+ seconds
- Can earn points from each post once per 24 hours

**Click Pass Bonuses:**
- Basic: +10 points per view
- Silver: +20 points per view
- Golden: +30 points per view

**NFT Collection Bonuses:**
- Each NFT in a collection: +1 point per view (configurable)
- Maximum 3 NFTs counted per collection (configurable)

**Example Calculation:**
```
Base: 1 point
+ Click Pass (Golden): 30 points
+ NFTs (3 from collection): 3 points
= 34 points per post view
```

### Publisher System

**Active Posts Limit:**
- Maximum 3 active posts at a time per publisher

**Post Duration by Pass Type:**
- Basic: 3 days
- Silver: 10 days
- Gold: 30 days

**Post Approval:**
- All new posts require admin approval
- Edited posts require re-approval
- Posts return to "pending" status after edits

### Rewards System

**Claiming:**
- Points are deducted immediately
- Claims start with "pending" status
- Admin must process to "sent" or "cancelled"

**Refunds:**
- Cancelled claims refund points to member
- Cancelled claims restore reward quantity

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

---

## Security Features

1. **CORS Protection** - Configurable allowed origins
2. **SQL Injection Prevention** - Prepared statements throughout
3. **Session Management** - Secure session configuration
4. **CSRF Tokens** - Generated and validated
5. **Authentication Checks** - Required for protected endpoints
6. **Admin Authorization** - Separate checks for admin-only actions
7. **Input Validation** - All user inputs validated
8. **Transaction Safety** - Database transactions for multi-step operations

---

## Development

### Testing Endpoints

Use tools like Postman or curl:

```bash
# Login
curl -X POST http://localhost:8888/api/auth.php?action=login \
  -H "Content-Type: application/json" \
  -d '{"address":"0x1234...","walletType":"ronin"}'

# Get Profile (with session cookie)
curl -X GET http://localhost:8888/api/members.php?action=profile \
  --cookie "PHPSESSID=your_session_id"
```

### Adding New Endpoints

1. Add action to the switch statement
2. Create handler function
3. Implement business logic
4. Use prepared statements for database queries
5. Return JSON with `sendResponse()` or `sendError()`

---

## Production Deployment

1. **Enable HTTPS** - Update `session.cookie_secure` to 1
2. **Configure CORS** - Set specific production domains
3. **Secure Database** - Use strong credentials
4. **Enable Error Logging** - Configure PHP error logs
5. **Disable Debug Mode** - Remove error display
6. **Use Environment Variables** - Store sensitive data in `.env`
7. **Set File Permissions** - Protect sensitive files
8. **Regular Backups** - Implement database backup strategy

---

## Support

For issues or questions, please refer to the main README.md or contact support.
