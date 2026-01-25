# RoninAds API Quick Reference

## Base URL
```
http://localhost:8888/api
```

## Authentication Endpoints

### Login
```bash
POST /api/auth.php?action=login
{"address": "0x...", "walletType": "ronin"}
```

### Check Session
```bash
GET /api/auth.php?action=check-session
```

### Logout
```bash
POST /api/auth.php?action=logout
```

## Member Endpoints

### Get Profile
```bash
GET /api/members.php?action=profile
```

### Get Stats
```bash
GET /api/members.php?action=stats
```

### Get Passes
```bash
GET /api/members.php?action=passes
```

### Update Points (Admin)
```bash
POST /api/members.php?action=update-points
{"memberId": 1, "pointsChange": 100, "reason": "Bonus"}
```

## Posts Endpoints

### List Posts
```bash
GET /api/posts.php?action=list&page=1&limit=20&type=ad
```

### Get Post
```bash
GET /api/posts.php?action=get&id=1
```

### Create Post
```bash
POST /api/posts.php?action=create
{"title": "...", "content": "...", "postType": "ad"}
```

### Update Post
```bash
PUT /api/posts.php?action=update
{"id": 1, "title": "...", "content": "..."}
```

### Delete Post
```bash
DELETE /api/posts.php?action=delete&id=1
```

### View Post (Earn Points)
```bash
POST /api/posts.php?action=view
{"postId": 1, "duration": 15}
```

### Get My Posts
```bash
GET /api/posts.php?action=my-posts
```

### Get Post Stats
```bash
GET /api/posts.php?action=stats&id=1
```

### Approve Post (Admin)
```bash
POST /api/posts.php?action=approve
{"id": 1, "approved": true}
```

## Rewards Endpoints

### List Rewards
```bash
GET /api/rewards.php?action=list&type=nft
```

### Get Reward
```bash
GET /api/rewards.php?action=get&id=1
```

### Claim Reward
```bash
POST /api/rewards.php?action=claim
{"rewardId": 1}
```

### Get My Claims
```bash
GET /api/rewards.php?action=my-claims
```

### Get All Claims (Admin)
```bash
GET /api/rewards.php?action=all-claims&status=pending&page=1
```

### Process Claim (Admin)
```bash
POST /api/rewards.php?action=process-claim
{"claimId": 1, "status": "sent", "transactionHash": "0x..."}
```

### Create Reward (Admin)
```bash
POST /api/rewards.php?action=create
{"name": "...", "type": "nft", "points": 1000, "quantity": 100}
```

### Update Reward (Admin)
```bash
PUT /api/rewards.php?action=update
{"id": 1, "name": "...", "points": 1500}
```

## NFTs Endpoints

### List Collections
```bash
GET /api/nfts.php?action=collections
```

### Get My NFTs
```bash
GET /api/nfts.php?action=my-nfts
```

### Update Holdings
```bash
POST /api/nfts.php?action=update-holdings
{"collectionId": 1, "nftCount": 5}
```

### Add Collection (Admin)
```bash
POST /api/nfts.php?action=add-collection
{"name": "...", "address": "0x...", "pointsPerNft": 1, "maxNfts": 3}
```

### Update Collection (Admin)
```bash
PUT /api/nfts.php?action=update-collection
{"id": 1, "name": "...", "pointsPerNft": 2}
```

## Admin Endpoints

### Dashboard
```bash
GET /api/admin.php?action=dashboard
```

### Pending Posts
```bash
GET /api/admin.php?action=pending-posts
```

### Pending Claims
```bash
GET /api/admin.php?action=pending-claims
```

### List Members
```bash
GET /api/admin.php?action=members&page=1&limit=50&search=0x...
```

### Toggle Member
```bash
POST /api/admin.php?action=toggle-member
{"memberId": 1}
```

### Make Admin
```bash
POST /api/admin.php?action=make-admin
{"memberId": 1, "role": "moderator"}
```

### Remove Admin
```bash
POST /api/admin.php?action=remove-admin
{"memberId": 1}
```

## Points Calculation

**Base View:** 1 point (10+ seconds)

**Click Pass Bonuses:**
- Basic: +10 points
- Silver: +20 points
- Golden: +30 points

**NFT Bonuses:**
- Per NFT: +1 point (configurable)
- Max: 3 NFTs per collection

**Example Total:** 1 + 30 (Golden Pass) + 3 (NFTs) = 34 points per view

## Post Duration

- Basic Pass: 3 days
- Silver Pass: 10 days
- Gold Pass: 30 days

## Limits

- Active posts per publisher: 3
- Post views: Once per 24 hours per member
- NFTs counted per collection: 3 (configurable)

## Response Format

### Success
```json
{
  "success": true,
  "data": {...}
}
```

### Error
```json
{
  "error": "Error message"
}
```

## Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 405: Method Not Allowed
- 500: Server Error
