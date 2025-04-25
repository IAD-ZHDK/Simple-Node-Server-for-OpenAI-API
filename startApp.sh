#!/bin/bash

# filepath: /Users/user/Documents/GitHub/Simple-Node-Server-for-OpenAI-API/startApp.sh
PROJECT_PATH="/Users/user/Documents/GitHub/ChatGPT_arduino"

# Navigate to the project directory
d "$(dirname "$0")"

# Check if npm install has been run
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
else
  echo "Dependencies already installed."
fi

# Check if .env file exists with OPENAI_API_KEY
if [ ! -f ".env" ]; then
  echo ".env file not found. Creating one..."
  echo "Please enter your OPENAI_API_KEY:"
  read -r OPENAI_API_KEY
  echo "OPENAI_API_KEY=$OPENAI_API_KEY" > .env
  echo ".env file created."
else
  echo ".env file exists."
fi

#  Start the server
SERVER_PID=$(lsof -i :3000 -t)
if [ -n "$SERVER_PID" ]; then
  echo "Server is already running. Restarting it..."
  kill -9 "$SERVER_PID"
fi
echo "Starting the server..."
npm start &

# ---------------------
# Browser Setup
# ---------------------

CHATGPT_KEY_PATH="$PROJECT_PATH/js/chatGPTkey.js"
INDEX_PATH="$PROJECT_PATH/index.html

# Check if chatGPTkey.js exists in the /js directory
"
if [ ! -f "$CHATGPT_KEY_PATH" ]; then
  echo "chatGPTkey.js file not found. Creating one..."
  mkdir -p "$(dirname "$CHATGPT_KEY_PATH")" 
  echo "Please enter your OPENAI_API_KEY:"
  read -r OPENAI_API_KEY
  echo "const OPENAI_API_KEY = '$OPENAI_API_KEY'" > "$CHATGPT_KEY_PATH"
  echo "chatGPTkey.js file created at $CHATGPT_KEY_PATH."
else
  echo "chatGPTkey.js file already exists at $CHATGPT_KEY_PATH."
fi

# Open Chrome and load index.html
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

if [ -f "$INDEX_PATH" ]; then
  echo "Opening Chrome with index.html..."
  "$CHROME_PATH" "$INDEX_PATH"
else
  echo "index.html not found in the specified directory."
fi