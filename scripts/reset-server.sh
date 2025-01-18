#!/bin/bash

# Kill any existing node processes on port 3000
echo "Killing existing processes on port 3000..."
lsof -ti :3000 | xargs kill -9 2>/dev/null || true

# Clean the build directory
echo "Cleaning build directory..."
rm -rf dist/

# Install dependencies if needed
echo "Installing dependencies..."
npm install

# Rebuild the project
echo "Building project..."
npm run build

# Start the server
echo "Starting server..."
npm start
