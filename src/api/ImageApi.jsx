import axios from "axios";

const VITE_DEEPAI_API_KEY = import.meta.env.VITE_DEEPAI_API_KEY;

export const generateAvatarImage = async (description) => {
  try {
    const response = await axios.post(
      "https://api.deepai.org/api/text2img", // DeepAI API endpoint
      new URLSearchParams({
        text: description, // Description text that you want to turn into an avatar
      }),
      {
        headers: {
          "Api-Key": "YOUR_DEEPAI_API_KEY", // Replace with your valid DeepAI API key
        },
      }
    );
    // Return the URL of the generated image from the response
    return response.data.output_url;  
  } catch (error) {
    console.error("Error generating avatar:", error);
    throw error; // Throwing error if the API request fails
  }
};
