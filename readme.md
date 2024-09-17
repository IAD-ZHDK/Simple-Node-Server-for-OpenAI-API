# Text-to-Speech Web App

This project is a simple node server that suplies synthesized speech using OpenAI API, based on text sent over . The server is built with Node.js, alowing easy access to 

## Prerequisites

- Node.js and npm installed on your machine.
- An OpenAI API key.


## Installation

1. Clone the repository and navigate to the project directory in the Terminal.

2. Install the dependencies with   

```  npm install ```  

3. Create a .env file in the root directory and add your OpenAI API key 

```  OPENAI_API_KEY='your_key_in_here' ```  

## Usage

1. Start the server with:

```  node server.js ```

2. Send a request to the server like this:  

```javascript
    let text = "tell me something exciting!";

    const response = await fetch('http://localhost:3000/text-to-speech', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text }) 
            });
            const data = await response.json();
            console.log(data);
```
3. Use the URL link in the response to find and play mp3 once it's avalaible.