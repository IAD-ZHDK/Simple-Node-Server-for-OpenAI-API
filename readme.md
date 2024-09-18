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
4. Vision API queries the image and returns a text description. The text is then displayed in the browser, and the description is used as prompt for Dall-E image generation:

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

1. Function defined in image-generator.js generates an image based on the VisionAPI response and saves it to the public folder:
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