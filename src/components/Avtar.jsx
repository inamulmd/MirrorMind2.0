import React, { useState, useEffect } from 'react';
import { generateAIResponse } from '../api/GeminiAi';

const Avatar = () => {
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [language, setLanguage] = useState('en-US'); // Default to English
  const [voices, setVoices] = useState([]);
  const [avatar3D, setAvatar3D] = useState(false);
  const [userGender, setUserGender] = useState(null); // 'male' or 'female'

  // Fetch available voices on component mount
  useEffect(() => {
    const synth = window.speechSynthesis;

    const voicesLoaded = () => {
      setVoices(synth.getVoices());
    };

    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = voicesLoaded;
    } else {
      voicesLoaded();
    }
    detectUserGenderByVoice();
  }, []);

  // Function to handle AI response in the requested language, but in English words
  const handleResponseInRequestedLanguage = async (input) => {
    let targetLanguage = language;

    // Friendly name mapping
    const languageMap = {
      'en-US': 'English',
      'hi-IN': 'Hindi',
      'bn-IN': 'Bengali',
    };

    try {
      const response = await generateAIResponse(
        `You are an assistant. Respond in ${languageMap[targetLanguage]}, but write in English script. Here's the user's message: "${input}"`
      );

      setAiResponse(response);
      speak(response, targetLanguage);
    } catch (error) {
      console.error("Error generating AI response:", error);
      setAiResponse("Oops, I couldn't respond right now.");
    }
  };

  // Function to handle speech synthesis
  const speak = (text, language) => {
    const synth = window.speechSynthesis;

    if (voices.length === 0) {
      console.error("No voices available.");
      return;
    }

    // Get voices matching selected language
    const languageVoices = voices.filter(voice => voice.lang === language);

    // Try to pick opposite gender voice
    let selectedVoice;

    if (userGender === 'male') {
      selectedVoice = languageVoices.find(voice =>
        /female|woman/i.test(voice.name)
      );
    } else if (userGender === 'female') {
      selectedVoice = languageVoices.find(voice =>
        /male|man/i.test(voice.name)
      );
    }

    // Fallback to a default voice if no match found
    if (!selectedVoice) {
      selectedVoice = languageVoices.find(voice =>
        voice.name.includes("Google")
      ) || voices[0];
    }

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = language;
    utter.voice = selectedVoice;
    utter.pitch = 1.2;
    utter.rate = 1;
    synth.speak(utter);
  };

  const detectUserGenderByVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.fftSize;
      const dataArray = new Uint8Array(bufferLength);

      const detectPitch = () => {
        analyser.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += Math.abs(dataArray[i] - 128);
        }
        const average = sum / bufferLength;

        if (average < 10) {
          console.log("Voice too quiet");
          return;
        }

        const isMale = average < 30;
        setUserGender(isMale ? 'male' : 'female');
        console.log(`Detected voice as: ${isMale ? 'male' : 'female'}`);

        stream.getTracks().forEach(track => track.stop());
      };

      setTimeout(detectPitch, 2000); // Wait 2 seconds of mic input
    } catch (error) {
      console.error("Voice detection error:", error);
    }
  };

  // Handle input submission
  const handleSend = async (input) => {
    const query = input || userInput.trim();
    if (!query) return;

    setLoading(true);
    try {
      await handleResponseInRequestedLanguage(query);
    } catch (error) {
      console.error("Error detecting language:", error);
    }
    setLoading(false);
  };

  // Start listening to the user's speech
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser doesn't support speech recognition. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();
    setListening(true);

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setUserInput(transcript);
      await handleSend(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };
  };

  // Handle avatar click to activate listening
  const handleAvatarClick = () => {
    setAvatar3D(true);
    startListening();
  };

  return (
    <div className="bg-white text-gray-800 min-h-screen">
      {/* Header */}
      <header className="text-center py-10 bg-gray-100 text-gray-800">
        <h1 className="text-4xl font-bold mb-2">Your AI Twin</h1>
        <p className="text-lg text-gray-600">Talk to your evolving self</p>
      </header>

      {/* Avatar Section */}
      <section className="flex flex-col items-center py-10">
        <div
          className="w-60 h-60 rounded-full overflow-hidden border-4 border-blue-500 shadow-md cursor-pointer transition-transform hover:scale-105"
          onClick={handleAvatarClick}
        >
          <img
            src={avatar3D
                ? "https://cdn.pixabay.com/photo/2023/01/26/13/28/ai-7746446_1280.png"
                : "https://cdn.pixabay.com/photo/2018/01/15/07/51/artificial-intelligence-3087618_1280.png"
            }
            alt="AI Twin Avatar"
            className="object-cover w-full h-full"
          />
        </div>
        <p className="mt-6 text-xl max-w-md text-center font-medium text-gray-700">
          {listening ? "🎙️ Listening..." : "“I evolve by listening to you. Let's talk.”"}
        </p>
      </section>

      {/* Input + Response Section */}
      <section className="bg-gray-50 py-8 px-4">
        <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-6">
          {/* Language Switch */}
          <div className="flex gap-3">
            <button onClick={() => setLanguage('en-US')} className={`px-3 py-1 rounded ${language === 'en-US' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>English</button>
            <button onClick={() => setLanguage('hi-IN')} className={`px-3 py-1 rounded ${language === 'hi-IN' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Hindi</button>
            <button onClick={() => setLanguage('bn-IN')} className={`px-3 py-1 rounded ${language === 'bn-IN' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Bengali</button>
          </div>

          {/* Input */}
          <div>
            <label htmlFor="input" className="block text-gray-700 font-medium mb-2">
              Speak your mind:
            </label>
            <input
              type="text"
              id="input"
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="e.g., What should I focus on today?"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Thinking..." : "Ask"}
            </button>
          </div>

          {/* AI Response */}
          {aiResponse && (
            <div className="border-t pt-6">
              <p className="text-gray-700 font-semibold">AI Response:</p>
              <p className="text-lg text-gray-800">{aiResponse}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Avatar;
