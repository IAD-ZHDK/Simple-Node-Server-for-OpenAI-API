const express = require('express');
require("dotenv").config();
const OpenAI = require("openai");
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

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

// Endpoint to handle text-to-speech requests
app.post('/text-to-speech', async (req, res) => {
  const { text } = req.body;

  //get a timestamp in YYYYMMDDHHMMSSMS format
  const timeStamp = new Date().toISOString().replace(/[^0-9]/g, '');

  const fileName = timeStamp + '.mp3';
  const filePath = path.resolve("./public/" + fileName);
  console.log(filePath);

  if (!text) {
    console.log('No text provided in the request body');
    return res.status(400).send('Text is required');
  }

  blockingDownload(text, fileName, filePath, res);

});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



async function blockingDownload(text, fileName, filePath, res) {
  try {
    console.log("Speech synthesis initializing.");
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
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


async function stream(text, fileName, filePath, res) {
  try {
    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',
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


async function streamToFile(stream, path) {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(path).on('error', reject).on('finish', resolve);

    // If you don't see a `stream.pipe` method and you're using Node you might need to add `import 'openai/shims/node'` at the top of your entrypoint file.
    stream.pipe(writeStream).on('error', (error) => {
      writeStream.close();
      reject(error);
    });
  });
}