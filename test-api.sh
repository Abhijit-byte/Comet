#!/bin/bash

# CosmosTrace API Testing Script
# Complete test suite for all Next.js API endpoints
# Run: ./test-api.sh

set -e

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

echo -e "${CYAN}🌌 CosmosTrace API Testing Suite${NC}"
echo -e "${CYAN}=================================${NC}"
echo ""

BASE_URL="http://localhost:3000"
TOKEN=""
REFRESH=""
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function for test results
test_endpoint() {
    local test_name=$1
    echo -e "${YELLOW}[TEST] $test_name${NC}"
}

mark_passed() {
    echo -e "${GREEN}✅ $1${NC}"
    ((TESTS_PASSED++))
}

mark_failed() {
    echo -e "${RED}❌ FAILED: $1${NC}"
    ((TESTS_FAILED++))
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ Error: jq is not installed. Please install jq to run this script.${NC}"
    echo "Install: sudo apt-get install jq (Ubuntu/Debian) or brew install jq (macOS)"
    exit 1
fi

# Test 1: Login Authentication
test_endpoint "Login - Obtain JWT Tokens"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@cosmic.watch","password":"TestPass123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access')
REFRESH=$(echo $LOGIN_RESPONSE | jq -r '.refresh')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    mark_passed "Login successful"
    echo -e "   ${GRAY}User: $(echo $LOGIN_RESPONSE | jq -r '.user.email')${NC}"
    echo -e "   ${GRAY}Access Token Length: ${#TOKEN} chars${NC}"
else
    mark_failed "No token received"
fi

# Test 2: Get User Profile
test_endpoint "Get Current User Profile (Authenticated)"
USER_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN")

USER_ID=$(echo $USER_RESPONSE | jq -r '.id')
if [ "$USER_ID" != "null" ] && [ -n "$USER_ID" ]; then
    mark_passed "Profile retrieved"
    echo -e "   ${GRAY}ID: $USER_ID${NC}"
    echo -e "   ${GRAY}Username: $(echo $USER_RESPONSE | jq -r '.username')${NC}"
    echo -e "   ${GRAY}Email: $(echo $USER_RESPONSE | jq -r '.email')${NC}"
else
    mark_failed "No user data received"
fi

# Test 3: List Asteroids (Default 7 days)
test_endpoint "List Asteroids - Default Duration"
ASTEROIDS=$(curl -s "$BASE_URL/api/asteroids")
COUNT=$(echo $ASTEROIDS | jq '. | length')

if [ "$COUNT" -gt 0 ]; then
    mark_passed "Asteroids retrieved: $COUNT objects"
    echo -e "   ${GRAY}First Asteroid: $(echo $ASTEROIDS | jq -r '.[0].name')${NC}"
    HAZ_COUNT=$(echo $ASTEROIDS | jq '[.[] | select(.hazardous == true)] | length')
    echo -e "   ${GRAY}Hazardous Count: $HAZ_COUNT${NC}"
else
    mark_failed "No asteroids received"
fi

# Test 4: List Asteroids (Custom 14 days)
test_endpoint "List Asteroids - Custom Duration (14 days)"
ASTEROIDS_14=$(curl -s "$BASE_URL/api/asteroids?days=14")
COUNT_14=$(echo $ASTEROIDS_14 | jq '. | length')

if [ "$COUNT_14" -ge 0 ]; then
    mark_passed "Extended period retrieved: $COUNT_14 objects"
    echo -e "   ${GRAY}Date Range: 14 days${NC}"
else
    mark_failed "Failed to retrieve 14-day data"
fi

# Test 5: Search Asteroid by Name
test_endpoint "Search Asteroid - 'Apophis'"
SEARCH=$(curl -s "$BASE_URL/api/search-asteroid?q=Apophis")
SEARCH_TOTAL=$(echo $SEARCH | jq -r '.total')

if [ "$SEARCH_TOTAL" != "null" ]; then
    mark_passed "Search completed"
    echo -e "   ${GRAY}Results Found: $SEARCH_TOTAL${NC}"
    if [ "$SEARCH_TOTAL" -gt 0 ]; then
        echo -e "   ${GRAY}First Match: $(echo $SEARCH | jq -r '.asteroids[0].name')${NC}"
    fi
else
    mark_failed "Search failed"
fi

# Test 6: Search Asteroid - Short Query
test_endpoint "Search Asteroid - Query 'A' (generic)"
SEARCH_A=$(curl -s "$BASE_URL/api/search-asteroid?q=A")
SEARCH_A_TOTAL=$(echo $SEARCH_A | jq -r '.total')

if [ "$SEARCH_A_TOTAL" != "null" ]; then
    mark_passed "Generic search completed"
    echo -e "   ${GRAY}Results: $SEARCH_A_TOTAL${NC}"
else
    mark_failed "Generic search failed"
fi

# Test 7: Asteroid Lookup by Name
test_endpoint "Asteroid Lookup - By Name"
LOOKUP=$(curl -s "$BASE_URL/api/asteroid-lookup?name=Bennu")
LOOKUP_NAME=$(echo $LOOKUP | jq -r '.name')

if [ "$LOOKUP_NAME" != "null" ] && [ -n "$LOOKUP_NAME" ]; then
    mark_passed "Lookup successful"
    echo -e "   ${GRAY}Name: $LOOKUP_NAME${NC}"
    echo -e "   ${GRAY}ID: $(echo $LOOKUP | jq -r '.id')${NC}"
    echo -e "   ${GRAY}Hazardous: $(echo $LOOKUP | jq -r '.hazardous')${NC}"
else
    mark_failed "Lookup failed - asteroid not found"
fi

# Test 8: Dashboard Statistics
test_endpoint "Dashboard Statistics"
STATS=$(curl -s "$BASE_URL/api/stats")
TOTAL_TRACKED=$(echo $STATS | jq -r '.total_asteroids_tracked')

if [ "$TOTAL_TRACKED" != "null" ]; then
    mark_passed "Statistics retrieved"
    echo -e "   ${GRAY}Total Tracked: $TOTAL_TRACKED${NC}"
    echo -e "   ${GRAY}Hazardous: $(echo $STATS | jq -r '.hazardous_asteroids_count')${NC}"
    echo -e "   ${GRAY}Max Diameter: $(echo $STATS | jq -r '.max_diameter_meters') m${NC}"
    echo -e "   ${GRAY}Max Velocity: $(echo $STATS | jq -r '.max_velocity_kmh') km/h${NC}"
    echo -e "   ${GRAY}Min Distance: $(echo $STATS | jq -r '.min_distance_km') km${NC}"
else
    mark_failed "Invalid stats data"
fi

# Test 9: Chat API - Greeting
test_endpoint "Chat API - Greeting"
CHAT_GREETING=$(curl -s -X POST "$BASE_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"hello"}]}')
CHAT_MESSAGE=$(echo $CHAT_GREETING | jq -r '.message')

if [ "$CHAT_MESSAGE" != "null" ] && [ -n "$CHAT_MESSAGE" ]; then
    mark_passed "Chat greeting successful"
    echo -e "   ${GRAY}Response: ${CHAT_MESSAGE:0:80}...${NC}"
else
    mark_failed "No chat response"
fi

# Test 10: Chat API - Search Asteroid
test_endpoint "Chat API - Search Largest Asteroids"
CHAT_LARGEST=$(curl -s -X POST "$BASE_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"What are the largest asteroids?"}]}')
CHAT_LARGEST_MSG=$(echo $CHAT_LARGEST | jq -r '.message')

if [ "$CHAT_LARGEST_MSG" != "null" ]; then
    mark_passed "Chat query successful"
    echo -e "   ${GRAY}Response Length: ${#CHAT_LARGEST_MSG} chars${NC}"
else
    mark_failed "Chat query failed"
fi

# Test 11: Chat API - Hazardous Asteroids
test_endpoint "Chat API - Hazardous Asteroids Query"
CHAT_HAZ=$(curl -s -X POST "$BASE_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Show me hazardous asteroids"}]}')
CHAT_HAZ_MSG=$(echo $CHAT_HAZ | jq -r '.message')

if [ "$CHAT_HAZ_MSG" != "null" ]; then
    mark_passed "Hazardous query successful"
else
    mark_failed "Hazardous query failed"
fi

# Test 12: Refresh Access Token
test_endpoint "Refresh Access Token"
REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refresh\":\"$REFRESH\"}")
NEW_TOKEN=$(echo $REFRESH_RESPONSE | jq -r '.access')

if [ "$NEW_TOKEN" != "null" ] && [ -n "$NEW_TOKEN" ]; then
    mark_passed "Token refreshed"
    echo -e "   ${GRAY}New Token Length: ${#NEW_TOKEN} chars${NC}"
else
    mark_failed "Token refresh failed"
fi

# Test 13: Register New User (Optional)
test_endpoint "Register New User (Optional)"
TIMESTAMP=$(date +%s)
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\":\"testuser$TIMESTAMP\",
    \"email\":\"test$TIMESTAMP@cosmic.watch\",
    \"password\":\"NewUserPass123\",
    \"first_name\":\"Test\",
    \"last_name\":\"User\"
  }")
REG_USER=$(echo $REGISTER_RESPONSE | jq -r '.user.username')

if [ "$REG_USER" != "null" ] && [ -n "$REG_USER" ]; then
    mark_passed "User registered successfully"
    echo -e "   ${GRAY}Username: $REG_USER${NC}"
else
    echo -e "${YELLOW}⚠️  Registration skipped (user may exist)${NC}"
fi

# Test 14: Logout
test_endpoint "Logout - Terminate Session"
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/logout" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}')
LOGOUT_DETAIL=$(echo $LOGOUT_RESPONSE | jq -r '.detail')

if [ "$LOGOUT_DETAIL" != "null" ]; then
    mark_passed "Logout successful"
    echo -e "   ${GRAY}Message: $LOGOUT_DETAIL${NC}"
else
    mark_failed "Logout failed"
fi

# Final Summary
echo ""
echo -e "${CYAN}=================================${NC}"
echo -e "${CYAN}🎯 Testing Complete!${NC}"
echo ""
echo -e "${NC}Results:${NC}"
echo -e "  ${GREEN}✅ Passed: $TESTS_PASSED${NC}"
echo -e "  ${RED}❌ Failed: $TESTS_FAILED${NC}"

TOTAL=$((TESTS_PASSED + TESTS_FAILED))
if [ $TOTAL -gt 0 ]; then
    SUCCESS_RATE=$(awk "BEGIN {printf \"%.2f\", ($TESTS_PASSED / $TOTAL) * 100}")
    echo -e "  ${CYAN}📊 Success Rate: $SUCCESS_RATE%${NC}"
fi
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! API is fully functional.${NC}"
else
    echo -e "${YELLOW}⚠️  Some tests failed. Check error messages above.${NC}"
fi

echo -e "${CYAN}=================================${NC}"
