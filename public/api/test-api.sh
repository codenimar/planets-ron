#!/bin/bash
# RoninAds API Test Script
# This script provides example API calls for testing

BASE_URL="http://localhost:8888"
SESSION_COOKIE=""

echo "======================================"
echo "RoninAds API Testing Script"
echo "======================================"
echo ""

# Function to print colored output
print_success() {
    echo -e "\033[0;32m✓ $1\033[0m"
}

print_error() {
    echo -e "\033[0;31m✗ $1\033[0m"
}

print_info() {
    echo -e "\033[0;34m→ $1\033[0m"
}

# Test 1: Login
echo "Test 1: Login"
echo "================================"
print_info "Logging in with test wallet..."

RESPONSE=$(curl -s -c cookies.txt -X POST "$BASE_URL/api/auth.php?action=login" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x1234567890123456789012345678901234567890",
    "walletType": "ronin"
  }')

if echo "$RESPONSE" | grep -q "success"; then
    print_success "Login successful"
    echo "$RESPONSE" | python3 -m json.tool
else
    print_error "Login failed"
    echo "$RESPONSE"
fi
echo ""

# Test 2: Check Session
echo "Test 2: Check Session"
echo "================================"
print_info "Checking session status..."

RESPONSE=$(curl -s -b cookies.txt -X GET "$BASE_URL/api/auth.php?action=check-session")

if echo "$RESPONSE" | grep -q "authenticated"; then
    print_success "Session is valid"
    echo "$RESPONSE" | python3 -m json.tool
else
    print_error "Session check failed"
    echo "$RESPONSE"
fi
echo ""

# Test 3: Get Profile
echo "Test 3: Get Member Profile"
echo "================================"
print_info "Fetching member profile..."

RESPONSE=$(curl -s -b cookies.txt -X GET "$BASE_URL/api/members.php?action=profile")

if echo "$RESPONSE" | grep -q "success"; then
    print_success "Profile retrieved"
    echo "$RESPONSE" | python3 -m json.tool
else
    print_error "Profile retrieval failed"
    echo "$RESPONSE"
fi
echo ""

# Test 4: List NFT Collections
echo "Test 4: List NFT Collections"
echo "================================"
print_info "Fetching NFT collections..."

RESPONSE=$(curl -s -b cookies.txt -X GET "$BASE_URL/api/nfts.php?action=collections")

if echo "$RESPONSE" | grep -q "success"; then
    print_success "Collections retrieved"
    echo "$RESPONSE" | python3 -m json.tool
else
    print_error "Collections retrieval failed"
    echo "$RESPONSE"
fi
echo ""

# Test 5: List Posts
echo "Test 5: List Active Posts"
echo "================================"
print_info "Fetching active posts..."

RESPONSE=$(curl -s -b cookies.txt -X GET "$BASE_URL/api/posts.php?action=list&page=1&limit=10")

if echo "$RESPONSE" | grep -q "success"; then
    print_success "Posts retrieved"
    echo "$RESPONSE" | python3 -m json.tool
else
    print_error "Posts retrieval failed"
    echo "$RESPONSE"
fi
echo ""

# Test 6: List Rewards
echo "Test 6: List Available Rewards"
echo "================================"
print_info "Fetching available rewards..."

RESPONSE=$(curl -s -b cookies.txt -X GET "$BASE_URL/api/rewards.php?action=list")

if echo "$RESPONSE" | grep -q "success"; then
    print_success "Rewards retrieved"
    echo "$RESPONSE" | python3 -m json.tool
else
    print_error "Rewards retrieval failed"
    echo "$RESPONSE"
fi
echo ""

# Test 7: Get Member Stats
echo "Test 7: Get Member Statistics"
echo "================================"
print_info "Fetching member stats..."

RESPONSE=$(curl -s -b cookies.txt -X GET "$BASE_URL/api/members.php?action=stats")

if echo "$RESPONSE" | grep -q "success"; then
    print_success "Stats retrieved"
    echo "$RESPONSE" | python3 -m json.tool
else
    print_error "Stats retrieval failed"
    echo "$RESPONSE"
fi
echo ""

# Test 8: Logout
echo "Test 8: Logout"
echo "================================"
print_info "Logging out..."

RESPONSE=$(curl -s -b cookies.txt -X POST "$BASE_URL/api/auth.php?action=logout")

if echo "$RESPONSE" | grep -q "success"; then
    print_success "Logout successful"
    echo "$RESPONSE" | python3 -m json.tool
else
    print_error "Logout failed"
    echo "$RESPONSE"
fi
echo ""

# Cleanup
rm -f cookies.txt

echo "======================================"
echo "API Testing Complete"
echo "======================================"
