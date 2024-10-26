const createImageGenerator = ({ openai, path, fs, axios }) => {
  const generateImage = async (imageData, timeStamp, size) => {
    const imageSize =
      size === 'small' ? '256x256' : size === 'medium' ? '512x512' : '1024x1024';

   // const dallePrompt = "Generate an image of: " + prompt;
    try {
      const response = await openai.images.createVariation({
        image: fs.createReadStream(imageData),
        n: 1,
        size: imageSize,
      });

      const imageUrl = response.data[0].url;
      const imagePath = path.resolve("./public/" + `${timeStamp}_dalle.png`);

      // Download and save the image
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(imagePath, imageResponse.data);
      console.log("Generated image saved to:", imagePath);
      return {
        imageUrl,
        savedImagePath: `${imagePath}/${timeStamp}_dalle.png` // Return the absolute path
      };
    } catch (error) {
      console.error("Error generating or saving image:", error);
      throw error;
    }
  };

  // Return an object with the generateImage function
  return { generateImage };
};

module.exports = createImageGenerator;