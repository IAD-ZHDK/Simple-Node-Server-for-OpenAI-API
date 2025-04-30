# Bits and Bolts


1. Make sure you have both Nodejs and Google Chrome installed.
2. Clone this repository and open it in Visual Studio Code.
3. Create a .env file in the root directory and add your OpenAI API key 
```  OPENAI_API_KEY='your_key_in_here' ```
4. Open `startApp.sh` and adjust ```PROJECT_PATH``` so it leads to your project repository
5. In Terminal type `npx http-server` to install node based simple server.
6. Open Terminal inside of VS Code and type `chmod +x startApp.sh`
7. Create alias to your bash script on Desktop `ln -s $(pwd)/startApp.sh /Users/user/Desktop`





# Text-to-Speech Web App

This project is a simple node server for accessing features of the OpenAI API that can only used via server-side code. The server is built with Node.js and intended to be run locally to access the API features through HTTP requests from a page that is also running locally. 

The main goal of this server is to make it easy to access these API features for design prototypes and artistic experiments. 

## Prerequisites

- Node.js and npm installed on your machine.
- An OpenAI API key.


## Installation

1. Clone the repository and navigate to the project directory in the Terminal.

2. Install the dependencies with   

```  npm install ```  

3. Create a .env file in the root directory and add your OpenAI API key 

```  OPENAI_API_KEY='your_key_in_here' ```  


4. Start the server with:

```  node server.js ```

## Usage of Text to speech:

1. Send a request to the server like this:  

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
2. Use the URL link in the response to find and play mp3 once it's avalaible.

Alternativley you can use the curl command to send a request:

1.  Type the this curl command in the terminal:

```terminal
    curl -X POST http://localhost:3000/text-to-speech      -H "Content-Type: application/json"      -d '{"text": "Tell me something exciting!"}'
```
2. Use the URL link in the response to find and play mp3 once it's avalaible.


## Usage of Vision API 

1. Vision API queries the image and returns a text description. The text is then displayed in the browser, and the description is used as prompt for Dall-E image generation:

```javascript
   const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `Describe the image. Be specific about the objects, or people, their colors, textures, etc. Use maximum ${maxTokens} tokens.`},
            {
              type: "image_url",
              image_url:  {
                url: `data:image/jpeg;base64,${base64Image}`,
                //change to high for more detailed response
                detail: "low"
              }
            },
          ],
        },
      ],
      //increase max_tokens for more detailed response
      max_tokens: maxTokens,
    });
```

2. A Function defined in image-generator.js generates an image based on the VisionAPI response and saves it to the public folder:
```javascript
    const dallePrompt = "Generate an image of: " + prompt;
    try {
      const response = await openai.images.generate({
        prompt: dallePrompt ,
        n: 1,
        size: imageSize,
      });
    }
    .....
```
