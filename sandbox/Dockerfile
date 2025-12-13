# Python Sandbox Environment for AI Agent Execution
# Isolated container for safe code execution

FROM python:3.11-slim

# Set working directory
WORKDIR /sandbox

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    wget \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js for JavaScript execution
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browsers
RUN playwright install chromium --with-deps

# Create non-root user for security
RUN useradd -m -s /bin/bash sandbox
USER sandbox

# Set environment
ENV PYTHONUNBUFFERED=1
ENV NODE_ENV=production

# Default command
CMD ["python", "-c", "print('Sandbox ready')"]
