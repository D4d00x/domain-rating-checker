#!/bin/bash

echo "🚀 Starting Domain Rating Checker Pro..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Creating .env file from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your API keys and email settings"
fi

# Create directories if they don't exist
mkdir -p data exports uploads

# Start the application
echo "🌐 Starting server on http://localhost:3000"
npm start
