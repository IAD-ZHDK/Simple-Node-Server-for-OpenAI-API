#!/bin/bash

# filepath: /Users/user/Documents/GitHub/Simple-Node-Server-for-OpenAI-API/startApp.sh
PROJECT_PATH="/Users/user/Desktop/ChatGPT_arduino"
NODE_PATH="/Users/user/Desktop/Simple-Node-Server-for-OpenAI-API"

# Navigate to the project directorys
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
cd "$NODE_PATH" && npm start &

# ---------------------
# Browser Setup
# ---------------------

CHATGPT_KEY_PATH="$PROJECT_PATH/js/chatGPTkey.js"
INDEX_PATH="$PROJECT_PATH/index.html"

# Check if chatGPTkey.js exists in the /js directory

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
#!/bin/bash

# Configuration
PORT=8080  # Default port for http-server
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Check if npm/npx is available
if ! command -v npx &>/dev/null; then
  echo "Error: npx is not installed. Please install Node.js from https://nodejs.org/"
  exit 1
fi

# Start the server using npx http-server
echo "Starting http-server on port $PORT..."
cd "$PROJECT_PATH" && npx http-server -p $PORT &
SERVER_PID=$!

# Give the server a moment to start
sleep 1

# Open Chrome with the server URL
echo "Opening Chrome with the local server..."
"$CHROME_PATH" "http://localhost:$PORT"

# Wait for user to press Ctrl+C
echo "Server running. Press Ctrl+C to stop."
trap "kill $SERVER_PID; echo 'Server stopped.'; exit 0" INT
wait $SERVER_PID