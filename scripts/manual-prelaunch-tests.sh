#!/bin/bash

# Manual Pre-Launch Testing Script
# Tests basic functionality of https://www.ghlagencyai.com

set -e

BASE_URL="https://www.ghlagencyai.com"
RESULTS_FILE="test-results/manual-test-results.json"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

mkdir -p test-results

echo "==================================="
echo "GHL Agency AI - Pre-Launch Tests"
echo "==================================="
echo "Target: $BASE_URL"
echo "Time: $TIMESTAMP"
echo ""

# Initialize results
cat > "$RESULTS_FILE" <<EOF
{
  "timestamp": "$TIMESTAMP",
  "baseUrl": "$BASE_URL",
  "tests": []
}
EOF

# Function to add test result
add_result() {
  local name="$1"
  local status="$2"
  local details="$3"

  echo "[$status] $name"
  if [ -n "$details" ]; then
    echo "  Details: $details"
  fi

  # Append to JSON (simplified - would need jq for proper JSON)
  echo "  - $name: $status" >> test-results/manual-test-summary.txt
}

# Test 1: Homepage accessibility
echo "Test 1: Homepage Accessibility"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")
TIME_TOTAL=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/")

if [ "$HTTP_CODE" = "200" ]; then
  add_result "Homepage loads" "PASS" "HTTP $HTTP_CODE in ${TIME_TOTAL}s"
else
  add_result "Homepage loads" "FAIL" "HTTP $HTTP_CODE"
fi

# Test 2: API Health endpoint
echo ""
echo "Test 2: API Health Endpoint"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")
HEALTH_RESPONSE=$(curl -s "$BASE_URL/api/health")

if [ "$HTTP_CODE" = "200" ]; then
  add_result "API Health endpoint" "PASS" "$HEALTH_RESPONSE"
else
  add_result "API Health endpoint" "FAIL" "HTTP $HTTP_CODE"
fi

# Test 3: Login page
echo ""
echo "Test 3: Login Page"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/login")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
  add_result "Login page loads" "PASS" "HTTP $HTTP_CODE"
else
  add_result "Login page loads" "FAIL" "HTTP $HTTP_CODE"
fi

# Test 4: Signup page
echo ""
echo "Test 4: Signup Page"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/signup")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
  add_result "Signup page loads" "PASS" "HTTP $HTTP_CODE"
else
  add_result "Signup page loads" "FAIL" "HTTP $HTTP_CODE"
fi

# Test 5: Dashboard (should redirect if not authenticated)
echo ""
echo "Test 5: Dashboard Access Control"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/dashboard")

if [ "$HTTP_CODE" = "302" ] || [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
  add_result "Dashboard auth check" "PASS" "Correctly requires auth (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" = "200" ]; then
  add_result "Dashboard auth check" "WARNING" "Returns 200 without auth - potential security issue"
else
  add_result "Dashboard auth check" "FAIL" "HTTP $HTTP_CODE"
fi

# Test 6: Static assets
echo ""
echo "Test 6: Static Assets"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/favicon.ico")

if [ "$HTTP_CODE" = "200" ]; then
  add_result "Favicon exists" "PASS" "HTTP $HTTP_CODE"
else
  add_result "Favicon exists" "FAIL" "HTTP $HTTP_CODE"
fi

# Test 7: HTTPS redirect
echo ""
echo "Test 7: HTTPS Security"
HTTP_RESPONSE=$(curl -s -I "http://www.ghlagencyai.com" | head -1)

if echo "$HTTP_RESPONSE" | grep -q "301\|302"; then
  add_result "HTTP to HTTPS redirect" "PASS" "Redirects to HTTPS"
else
  add_result "HTTP to HTTPS redirect" "WARNING" "Check HTTPS enforcement"
fi

# Test 8: Response headers security
echo ""
echo "Test 8: Security Headers"
HEADERS=$(curl -s -I "$BASE_URL/")

check_header() {
  local header="$1"
  if echo "$HEADERS" | grep -qi "$header"; then
    add_result "Security header: $header" "PASS" "Present"
  else
    add_result "Security header: $header" "WARNING" "Missing"
  fi
}

check_header "Content-Security-Policy"
check_header "X-Frame-Options"
check_header "X-Content-Type-Options"
check_header "Strict-Transport-Security"

# Test 9: API endpoints that should exist
echo ""
echo "Test 9: Critical API Endpoints"

test_api_endpoint() {
  local endpoint="$1"
  local expected_code="$2"
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")

  if [ "$HTTP_CODE" = "$expected_code" ]; then
    add_result "Endpoint $endpoint" "PASS" "HTTP $HTTP_CODE"
  else
    add_result "Endpoint $endpoint" "FAIL" "Expected $expected_code, got $HTTP_CODE"
  fi
}

# Test various endpoints (401/403 expected for protected routes)
test_api_endpoint "/api/trpc/health.check" "200"

# Test 10: Page load performance
echo ""
echo "Test 10: Performance Check"
TIME_TOTAL=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/")
TIME_MS=$(echo "$TIME_TOTAL * 1000" | bc | cut -d'.' -f1)

if [ "$TIME_MS" -lt 3000 ]; then
  add_result "Homepage load time" "PASS" "${TIME_MS}ms (< 3s)"
elif [ "$TIME_MS" -lt 5000 ]; then
  add_result "Homepage load time" "WARNING" "${TIME_MS}ms (3-5s)"
else
  add_result "Homepage load time" "FAIL" "${TIME_MS}ms (> 5s)"
fi

echo ""
echo "==================================="
echo "Test Summary"
echo "==================================="
cat test-results/manual-test-summary.txt

echo ""
echo "Results saved to: $RESULTS_FILE"
