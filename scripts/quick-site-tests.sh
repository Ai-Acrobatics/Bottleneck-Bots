#!/bin/bash

# Quick site validation tests
BASE_URL="https://www.ghlagencyai.com"

echo "==== GHL Agency AI - Quick Site Tests ===="
echo ""

# Test 1: Homepage
echo "1. Testing Homepage..."
RESP=$(curl -s -o /dev/null -w "%{http_code}|%{time_total}" "$BASE_URL/")
CODE=$(echo $RESP | cut -d'|' -f1)
TIME=$(echo $RESP | cut -d'|' -f2)
if [ "$CODE" = "200" ]; then
  echo "   ✓ Homepage: HTTP $CODE (${TIME}s)"
else
  echo "   ✗ Homepage: HTTP $CODE"
fi

# Test 2: API Health
echo "2. Testing API Health..."
RESP=$(curl -s "$BASE_URL/api/health")
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")
if [ "$CODE" = "200" ]; then
  echo "   ✓ API Health: $RESP"
else
  echo "   ✗ API Health: HTTP $CODE"
fi

# Test 3: Login page
echo "3. Testing Login Page..."
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/login")
if [ "$CODE" = "200" ]; then
  echo "   ✓ Login Page: HTTP $CODE"
else
  echo "   ✗ Login Page: HTTP $CODE"
fi

# Test 4: Signup page
echo "4. Testing Signup Page..."
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/signup")
if [ "$CODE" = "200" ]; then
  echo "   ✓ Signup Page: HTTP $CODE"
else
  echo "   ✗ Signup Page: HTTP $CODE"
fi

# Test 5: Dashboard (should require auth)
echo "5. Testing Dashboard Auth..."
CODE=$(curl -s -o /dev/null -w "%{http_code}" -L "$BASE_URL/dashboard")
if [ "$CODE" = "200" ]; then
  echo "   ? Dashboard: HTTP $CODE (check if public or redirected)"
else
  echo "   ✓ Dashboard: HTTP $CODE (requires auth)"
fi

# Test 6: Check key pages exist
echo "6. Testing Key Pages..."
for page in "pricing" "about" "contact" "features"; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/$page")
  if [ "$CODE" = "200" ] || [ "$CODE" = "404" ]; then
    echo "   - /$page: HTTP $CODE"
  fi
done

echo ""
echo "==== Tests Complete ===="
