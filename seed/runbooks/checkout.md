# Checkout Service Runbook

## Symptoms

- High response latency or 500 status code rate.
- Database connection pool exhaustion errors in logs.

## Troubleshooting Steps

1. Check active database connection metrics.
2. Restart shop-api pods if connections are deadlocked.
3. Validate Redis cache availability.
