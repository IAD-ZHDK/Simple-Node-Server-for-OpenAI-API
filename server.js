const express = require('express');
require("dotenv").config();
const OpenAI = require("openai");
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const port = 3000;

// Increase maxTokens for more detailed response
const maxTokens = 30;

// Middleware to parse JSON bodies
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

// Enable CORS for all routes
app.use(cors());

// Serve static files from the 'public' directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Function to delete all the old files in the public folder
/*
const clearPublicFolder = () => {
    const publicFolderPath = path.join(__dirname, 'public');
    fs.readdir(publicFolderPath, (err, files) => {
      if (err) {
        console.error('Error reading public folder:', err);
        return;
      }
  
      files.forEach((file) => {
        const filePath = path.join(publicFolderPath, file);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Error deleting file:', filePath, err);
          } else {
            console.log('Deleted file:', filePath);
          }
        });
      });
    });
  };
  */
// Clear the public folder when the server starts
//clearPublicFolder();


// Configure OpenAI API

// Add a route to handle requests to the root path
app.get('/', (req, res) => {
  res.send('Server is running');
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const createImageGenerator = require('./image-generator');
const imageGenerator = createImageGenerator({openai, path, fs, axios});

// Endpoint to handle vision requests
app.post('/vision', async (req, res) => {
  const imageData = req.body.image;

  if (!imageData) {
    console.log('No valid image data provided');
    return res.status(400).send('Image data is required');
  } 

  const imageBuffer = Buffer.from(imageData, 'base64');
  const timeStamp = new Date().toISOString().replace(/[^0-9]/g, '');
  const imageName = timeStamp + '.jpg';

  const imagePath = path.resolve("./public/" + imageName);
  fs.writeFileSync(imagePath, imageBuffer);

  console.log(`Image saved to ${imagePath}`);
 
  try {
    const visionResponse = await sendToVision(imagePath);
    //you can add size parameter, "small" for 256x256, "medium" for 512x512, nothing for 1024x1024
    await imageGenerator.generateImage(visionResponse, timeStamp, "small");
    res.json({ result: visionResponse });
  } catch (error) {
    console.error('Error processing vision request:', error);
    res.status(500).json({ error: 'Error processing vision request' });
  }
  
  

});

// Endpoint to handle text-to-speech requests
app.post('/text-to-speech', async (req, res) => {
  const { text, voice = 1 } = req.body; // Extract voice parameter with default value
  let voiceName = getVoiceName(voice);

  console.log('Received text:', text);
  console.log('Received voice:', voiceName);

  //get a timestamp in YYYYMMDDHHMMSSMS format
  const timeStamp = new Date().toISOString().replace(/[^0-9]/g, '');

  const fileName = timeStamp + '.mp3';
  const filePath = path.resolve("./public/" + fileName);
  console.log(filePath);

  if (!text) {
    console.log('No text provided in the request body');
    return res.status(400).send('Text is required');
  }

  download(text, fileName, filePath, res, voiceName);

});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



async function download(text, fileName, filePath, res, voiceString) {
  try {
    console.log("Speech synthesis initializing.");
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voiceString,
      //speed: "1.0", // anything apart from the default is pretty poor quality 
      input: text,
    });

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(filePath, buffer);
    console.log("Speech synthesis complete.");
    const fileUrl = `http://localhost:${port}/public/${fileName}`;
    res.json({ url: fileUrl });

    // Schedule file deletion after 5 minutes (300000 milliseconds)
    setTimeout(() => {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting the audio file:', err);
        } else {
          console.log('Audio file deleted successfully:', fileName);
        }
      });
    }, 300000);

  } catch (error) {
    console.log("Speech synthesis failed.");
    console.error(error);
    res.status(500).send('Error processing text-to-speech request');
  }

}

// this is an atempt to stream the mp3, with out waiting for the download to complete
// currently not implemented.
async function stream(text, fileName, filePath, res, voiceString) {
  try {
    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voiceString,
      input: text,
    });

    const stream = response.body;
  
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const fileUrl = `http://localhost:${port}/public/${fileName}`;
    console.log(`Streaming response to ${fileUrl}`);
    res.json({ url: fileUrl });
    await streamToFile(stream, filePath);
    console.log('finished streaming');

  } catch (error) {
    console.log("Speech synthesis failed.");
    console.error(error);
    res.status(500).send('Error processing text-to-speech request');
  }
}

function getVoiceName(index) {
  switch (index) {
    case 0:
      return 'onyx';
    case 1:
      return 'nova';
    case 2:
      return 'shimmer';
    case 3:
      return 'echo';
    case 4:
      return 'fable';
    case 5:
      return 'alloy';
    default:
      return 'onyx'; // Default voice
  }
}


async function streamToFile(stream, path) {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(path).on('error', reject).on('finish', resolve);

    stream.pipe(writeStream).on('error', (error) => {
      writeStream.close();
      reject(error);
    });
  });
}

async function sendToVision(filePath) {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString('base64');

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

  console.log(response.choices[0].message.content);
  return response.choices[0].message.content;

  } catch (error) {
    console.error("Error in OpenAI Vision API :", error);
    throw error;
  }
}