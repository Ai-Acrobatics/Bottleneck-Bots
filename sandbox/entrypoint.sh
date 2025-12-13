#!/bin/bash
# Sandbox Entrypoint Script
# Handles initialization and code execution in isolated environment

set -e

# Environment setup
export PYTHONUNBUFFERED=1
export NODE_ENV=production

# Create workspace directory
WORKSPACE="${SANDBOX_WORKSPACE:-/sandbox/workspace}"
mkdir -p "$WORKSPACE"
cd "$WORKSPACE"

# Function to execute code based on language
execute_code() {
    local language="$1"
    local code="$2"
    local timeout="${SANDBOX_TIMEOUT:-30}"

    case "$language" in
        python|py)
            timeout "$timeout" python -c "$code"
            ;;
        javascript|js|node)
            timeout "$timeout" node -e "$code"
            ;;
        bash|sh|shell)
            timeout "$timeout" bash -c "$code"
            ;;
        *)
            echo "Error: Unsupported language: $language"
            exit 1
            ;;
    esac
}

# Function to execute a file
execute_file() {
    local filepath="$1"
    local timeout="${SANDBOX_TIMEOUT:-30}"
    local extension="${filepath##*.}"

    case "$extension" in
        py)
            timeout "$timeout" python "$filepath"
            ;;
        js|mjs)
            timeout "$timeout" node "$filepath"
            ;;
        sh|bash)
            timeout "$timeout" bash "$filepath"
            ;;
        ts)
            timeout "$timeout" npx tsx "$filepath"
            ;;
        *)
            echo "Error: Unsupported file extension: $extension"
            exit 1
            ;;
    esac
}

# Main execution logic
main() {
    case "${1:-shell}" in
        exec)
            # Execute inline code: exec <language> <code>
            execute_code "$2" "$3"
            ;;
        run)
            # Execute file: run <filepath>
            execute_file "$2"
            ;;
        shell)
            # Interactive shell
            exec /bin/bash
            ;;
        python)
            # Python REPL
            exec python
            ;;
        node)
            # Node REPL
            exec node
            ;;
        *)
            # Default: run the provided command
            exec "$@"
            ;;
    esac
}

main "$@"
