#!/bin/bash

# ========================================
# 1klive API Test Script
# ========================================

echo ""
echo "🧪 ========================================"
echo "🧪 1klive API Testing"
echo "🧪 ========================================"
echo ""

BASE_URL="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Test function
test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local description=$4
  
  echo -n "Testing: $description ... "
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "$BASE_URL$endpoint")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✅ PASSED${NC} (HTTP $http_code)"
    ((PASSED++))
    if [ ! -z "$body" ]; then
      echo "   Response: $body" | head -c 100
      echo ""
    fi
  else
    echo -e "${RED}❌ FAILED${NC} (HTTP $http_code)"
    ((FAILED++))
    if [ ! -z "$body" ]; then
      echo "   Error: $body"
    fi
  fi
  echo ""
}

# Run tests
echo "📡 Testing API endpoints..."
echo ""

test_endpoint "GET" "/api/health" "" "Health Check"

test_endpoint "GET" "/api/notifications/vapid" "" "Get VAPID Public Key"

test_endpoint "GET" "/api/notifications/stats" "" "Get Subscription Stats"

echo ""
echo "📊 Test Results:"
echo "   Passed: ${GREEN}$PASSED${NC}"
echo "   Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed${NC}"
  exit 1
fi
