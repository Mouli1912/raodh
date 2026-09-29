#!/usr/bin/env bash
# Fires a sample alert to /v1/alerts
curl -X POST http://localhost:8000/v1/alerts \
  -H "Content-Type: application/json" \
  -d '{"service": "shop-api", "alert": "High latency on checkout endpoint"}'
