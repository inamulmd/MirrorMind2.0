
import axios from "axios";

const VITE_OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const GEMINI_URL =`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${VITE_OPENAI_API_KEY}`



export const generateAIResponse = async (userPrompt) => {

    try{
        console.log("loading")
         const response = await axios.post( GEMINI_URL,{
            contents: [{
            parts:[{text: userPrompt}]
              }]
          }
    );

    console.log(response);

    const reply =response['data']['candidates'][0]['content']['parts']['0']['text'];
    return reply;
    }
    catch(error){
        console.error("Error while calling Gemini API:", error);
        return "Sorry, I couldn't think of anything right now."; // fallback message
    };
    
}