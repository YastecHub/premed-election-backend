#!/bin/bash

# Simple Health Monitoring Script
# Usage: ./monitor.sh [url] [interval_seconds]
# Example: ./monitor.sh http://localhost:5000 10

URL="${1:-http://localhost:5000}"
INTERVAL="${2:-30}"
HEALTH_ENDPOINT="$URL/api/health"

echo "🏥 Starting health monitor for: $HEALTH_ENDPOINT"
echo "📊 Checking every $INTERVAL seconds"
echo "Press Ctrl+C to stop"
echo "---"

while true; do
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
  
  RESPONSE=$(curl -s -w "\n%{http_code}" --max-time 10 "$HEALTH_ENDPOINT" 2>/dev/null || echo "000")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  
  if [ "$HTTP_CODE" -eq 200 ]; then
    # Extract memory info if available
    HEAP_USED=$(echo "$BODY" | grep -o '"heapUsed":[0-9]*' | cut -d':' -f2)
    RSS=$(echo "$BODY" | grep -o '"rss":[0-9]*' | cut -d':' -f2)
    
    if [ -n "$HEAP_USED" ] && [ -n "$RSS" ]; then
      echo "[$TIMESTAMP] ✅ OK | Heap: ${HEAP_USED}MB | RSS: ${RSS}MB"
      
      # Warning thresholds
      if [ "$HEAP_USED" -gt 200 ]; then
        echo "  ⚠️  WARNING: High heap usage (${HEAP_USED}MB > 200MB)"
      fi
      if [ "$RSS" -gt 400 ]; then
        echo "  🚨 CRITICAL: High RSS (${RSS}MB > 400MB)"
      fi
    else
      echo "[$TIMESTAMP] ✅ OK | Status: $HTTP_CODE"
    fi
  elif [ "$HTTP_CODE" -eq 000 ]; then
    echo "[$TIMESTAMP] ❌ UNREACHABLE | Endpoint: $HEALTH_ENDPOINT"
  else
    echo "[$TIMESTAMP] ⚠️  ERROR | Status: $HTTP_CODE"
  fi
  
  sleep "$INTERVAL"
done
