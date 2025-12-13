# Agent Sandbox Environment

Isolated execution environment for AI agent code execution.

## Overview

The sandbox provides a secure, isolated container for executing:
- Python scripts
- Node.js/JavaScript code
- Shell commands
- TypeScript files

## Security Features

- **Isolated containers**: Each execution runs in its own Docker container
- **Resource limits**: CPU, memory, and disk quotas
- **Network restrictions**: Limited network access
- **Non-root user**: Code runs as unprivileged user
- **Timeout enforcement**: Automatic termination after timeout
- **Read-only system files**: Prevents system modification

## Quick Start

### Build the sandbox image

```bash
docker build -t agent-sandbox .
```

### Run code execution

```bash
# Execute Python code
docker run --rm agent-sandbox exec python "print('Hello, World!')"

# Execute JavaScript code
docker run --rm agent-sandbox exec javascript "console.log('Hello, World!')"

# Execute shell command
docker run --rm agent-sandbox exec shell "echo 'Hello, World!'"

# Run a Python file
docker run --rm -v $(pwd)/scripts:/sandbox/workspace agent-sandbox run /sandbox/workspace/script.py
```

### Interactive mode

```bash
# Python REPL
docker run -it --rm agent-sandbox python

# Node REPL
docker run -it --rm agent-sandbox node

# Bash shell
docker run -it --rm agent-sandbox shell
```

## Resource Limits

Default limits (configurable via environment variables):

| Resource | Limit |
|----------|-------|
| Memory | 512MB |
| CPU | 1 core |
| Timeout | 30 seconds |
| Disk | 1GB |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SANDBOX_TIMEOUT` | Max execution time (seconds) | 30 |
| `SANDBOX_WORKSPACE` | Working directory | /sandbox/workspace |

## Installed Packages

### Python
- anthropic
- docker
- playwright
- requests
- beautifulsoup4
- pandas
- numpy
- httpx
- aiohttp
- pydantic

### Node.js
- Node.js 20.x runtime
- npm/npx available
- tsx for TypeScript execution

### System Tools
- git
- curl
- wget
- jq

## Integration with Agent Tools

The sandbox is used by the `ShellTool` for executing commands:

```typescript
import { getToolRegistry } from './server/services/tools';

const registry = getToolRegistry();
const result = await registry.execute('shell', {
  action: 'exec',
  command: 'python -c "print(1+1)"'
}, context);
```

## Development

### Rebuild after changes

```bash
docker build --no-cache -t agent-sandbox .
```

### Test the sandbox

```bash
# Run all tests
docker run --rm agent-sandbox exec python "import sys; print(sys.version)"
docker run --rm agent-sandbox exec javascript "console.log(process.version)"
docker run --rm agent-sandbox exec shell "echo $SHELL"
```
