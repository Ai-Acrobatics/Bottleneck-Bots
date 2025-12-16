# Load Testing Suite

Performance and load testing for GHL Agency AI using [k6](https://k6.io/).

## Prerequisites

### Install k6

```bash
# macOS
brew install k6

# Ubuntu/Debian
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
choco install k6

# Docker
docker pull grafana/k6
```

## Test Types

| Test | Purpose | Duration | VUs |
|------|---------|----------|-----|
| **Smoke** | Verify basic functionality | ~4 min | 5 |
| **Load** | Normal + peak traffic | ~16 min | 50-100 |
| **Stress** | Find breaking points | ~26 min | 100-300 |
| **Spike** | Sudden traffic bursts | ~6 min | 10-500 |

## Running Tests

### Local Development

```bash
# Run smoke test first
k6 run tests/load/api-smoke.test.js

# Run full load test
k6 run tests/load/api-load.test.js

# Run stress test (use with caution)
k6 run tests/load/api-stress.test.js

# Run spike test
k6 run tests/load/api-spike.test.js
```

### Against Production

```bash
# Set environment variables
export BASE_URL=https://ghlagencyai.com
export API_KEY=your-api-key

# Run smoke test against production
k6 run -e BASE_URL=$BASE_URL -e API_KEY=$API_KEY tests/load/api-smoke.test.js
```

### Using Docker

```bash
# Smoke test
docker run -v $(pwd)/tests/load:/scripts grafana/k6 run /scripts/api-smoke.test.js

# With environment variables
docker run -v $(pwd)/tests/load:/scripts \
  -e BASE_URL=https://ghlagencyai.com \
  -e API_KEY=your-key \
  grafana/k6 run /scripts/api-load.test.js
```

### Cloud Execution (Grafana Cloud k6)

```bash
# Login to k6 cloud
k6 login cloud

# Run in cloud
k6 cloud tests/load/api-load.test.js
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BASE_URL` | Target API base URL | `http://localhost:3000` |
| `API_KEY` | API key for authenticated endpoints | - |
| `ENVIRONMENT` | Environment tag (local/staging/production) | `local` |

### Thresholds

Default performance thresholds:

```javascript
{
  http_req_duration: [
    'p(50)<200',   // 50% under 200ms
    'p(90)<500',   // 90% under 500ms
    'p(95)<1000',  // 95% under 1s
    'p(99)<2000',  // 99% under 2s
  ],
  http_req_failed: ['rate<0.01'], // <1% error rate
}
```

## Test Results

Results are saved to `tests/load/results/`:

```
tests/load/results/
├── smoke-summary.json
├── load-2024-01-15T10-30-00.json
├── stress-2024-01-15T11-00-00.json
├── stress-summary-2024-01-15T11-00-00.json
├── spike-2024-01-15T12-00-00.json
└── spike-analysis-2024-01-15T12-00-00.json
```

### Viewing Results

```bash
# Create results directory
mkdir -p tests/load/results

# Run test and view summary
k6 run tests/load/api-smoke.test.js

# JSON output for CI/CD
k6 run --out json=results.json tests/load/api-smoke.test.js

# InfluxDB output for Grafana
k6 run --out influxdb=http://localhost:8086/k6 tests/load/api-load.test.js
```

## CI/CD Integration

### GitHub Actions Example

```yaml
load-test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - name: Install k6
      run: |
        curl -s https://dl.k6.io/key.gpg | sudo apt-key add -
        echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
        sudo apt-get update
        sudo apt-get install k6

    - name: Run smoke test
      run: |
        k6 run -e BASE_URL=${{ secrets.STAGING_URL }} \
               -e API_KEY=${{ secrets.API_KEY }} \
               tests/load/api-smoke.test.js

    - name: Upload results
      uses: actions/upload-artifact@v3
      with:
        name: k6-results
        path: tests/load/results/
```

## Interpreting Results

### Key Metrics

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| p95 Response Time | <500ms | 500ms-1s | >1s |
| Error Rate | <1% | 1-5% | >5% |
| RPS (requests/sec) | >100 | 50-100 | <50 |

### Common Issues

1. **High p95 but low average**: Some requests are slow (database queries, cold starts)
2. **Increasing error rate over time**: Memory leak or connection pool exhaustion
3. **Sudden latency spike**: GC pause, external service timeout
4. **Rate limiting**: Check `X-RateLimit-*` headers

## Best Practices

1. **Always run smoke test first** to verify system is operational
2. **Start with conservative loads** and gradually increase
3. **Monitor application logs** during stress tests
4. **Run tests during low-traffic periods** for production
5. **Compare results over time** to catch regressions
6. **Use realistic think times** between requests

## Troubleshooting

### Connection Refused

```bash
# Check if server is running
curl http://localhost:3000/api/health
```

### High Error Rate

```bash
# Check server logs
tail -f logs/server.log

# Check rate limiting
curl -v http://localhost:3000/api/health | grep X-RateLimit
```

### Timeout Errors

```bash
# Increase k6 timeout
k6 run --http-timeout 30s tests/load/api-smoke.test.js
```
