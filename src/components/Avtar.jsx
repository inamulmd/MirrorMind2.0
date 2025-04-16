import React, { useState, useEffect } from 'react';
import { generateAIResponse } from '../api/GeminiAi';
import { generateAvatarImage } from '../api/ImageApi';
import { useMirror } from '../context/MirrorContext';

const Avtar = () => {
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [voices, setVoices] = useState([]);
  const [userGender, setUserGender] = useState(null);
  const { addMessage } = useMirror(); // Access addMessage function from context

  // New states for avatar image
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const [conversation, setConversation] = useState([]); // Store chat log

  // Fetch available voices
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

  // Generate avatar when user input changes
  useEffect(() => {
    if (userInput.trim()) {
      generateAvatar(userInput);
    }
  }, [userInput]);

  // Save conversation every 3 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (conversation.length > 0) {
        // Add conversation chunk to the timeline (context)
        addMessage({
          timestamp: new Date().toISOString(),
          entries: conversation,
        });
        setConversation([]); // Clear after saving
      }
    }, 180000); // 180000 ms = 3 minutes

    return () => clearInterval(interval);
  }, [conversation, addMessage]);

  const generateAvatar = async (description) => {
    try {
      setAvatarLoading(true);
      const url = await generateAvatarImage(description);
      setAvatarUrl(url);
    } catch (error) {
      console.error('Error generating avatar:', error);
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleResponseInRequestedLanguage = async (input) => {
    let targetLanguage = language;

    const languageMap = {
      'en-US': 'English',
      'hi-IN': 'Hindi',
      'bn-IN': 'Bengali',
    };

    try {
      let response = await generateAIResponse(
        `You are an assistant. Respond in ${languageMap[targetLanguage]}, but write in English script. Here's the user's message: "${input}"`
      );

      // Transliterate if the response is in a non-English language
      if (targetLanguage !== 'en-US') {
        response = transliterateToEnglish(response);
      }

      setAiResponse(response);
      speak(response, targetLanguage); // Ensure that correct voice is used
    } catch (error) {
      console.error('Error generating AI response:', error);
      setAiResponse("Oops, I couldn't respond right now.");
    }
  };

  const speak = (text, language) => {
    const synth = window.speechSynthesis;

    if (voices.length === 0) {
      console.error('No voices available.');
      return;
    }

    const languageVoices = voices.filter((voice) => voice.lang.includes(language)); // Check for language match

    let selectedVoice;

    if (userGender === 'male') {
      selectedVoice = languageVoices.find((voice) => /female|woman/i.test(voice.name));
    } else if (userGender === 'female') {
      selectedVoice = languageVoices.find((voice) => /male|man/i.test(voice.name));
    }

    if (!selectedVoice) {
      selectedVoice = languageVoices.find((voice) => voice.name.includes('Google')) || voices[0];
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
          console.log('Voice too quiet');
          return;
        }

        const isMale = average < 30;
        setUserGender(isMale ? 'male' : 'female');
        console.log(`Detected voice as: ${isMale ? 'male' : 'female'}`);
        stream.getTracks().forEach((track) => track.stop());
      };

      setTimeout(detectPitch, 2000);
    } catch (error) {
      console.error('Voice detection error:', error);
    }
  };

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
      console.error('Speech recognition error:', event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };
  };

  const handleSend = async (inputText = userInput) => {
    if (!inputText.trim()) return;

    setLoading(true);

    try {
      const response = await generateAIResponse(inputText);
      setAiResponse(response);

      // Add to conversation
      setConversation(prev => [
        ...prev,
        { user: inputText, ai: response, time: new Date().toLocaleTimeString() }
      ]);

      // Add to the timeline (MirrorContext)
      addMessage({
        timestamp: new Date().toISOString(),
        entries: [
          { user: inputText, ai: response, time: new Date().toLocaleTimeString() }
        ]
      });

      speak(response, language);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setUserInput('');
    }
  };

  // Function to transliterate non-English text to English script
  const transliterateToEnglish = (text) => {
    // Example: "नमस्ते" -> "Namaste"
    return text; // You can implement actual transliteration logic or use a library/API
  };

  return (
    <div className="bg-white text-gray-800 min-h-screen">
      {/* Header */}
      <header className="text-center py-10 bg-gray-100 text-gray-800">
        <h1 className="text-4xl font-bold mb-2">Your AI Twin</h1>
        <p className="text-lg text-gray-600">Talk to your evolving self</p>
      </header>

      {/* Avatar Section */}
      <section className="flex flex-col items-center py-10 space-y-4">
        <div onClick={startListening} className="cursor-pointer">
          {avatarLoading ? (
            <p className="text-gray-500">Generating avatar...</p>
          ) : avatarUrl ? (
            <img src={avatarUrl} alt="AI Avatar" className="w-48 h-48 rounded-full object-cover border-4 shadow-lg avatar-3d" />
          ) : (
            <p className="text-red-500">Failed to load avatar</p>
          )}
        </div>

        <p className="mt-6 text-xl max-w-md text-center font-medium text-gray-700">
          {listening ? '🎙️ Listening...' : "“I evolve by listening to you. Let's talk.”"}
        </p>
      </section>

      {/* Input + Response Section */}
      <section className="bg-gray-50 py-8 px-4">
        <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-6">
          {/* Language Switch */}
          <div className="flex gap-3">
            {['en-US', 'hi-IN', 'bn-IN'].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1 rounded ${language === lang ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                {lang === 'en-US' ? 'English' : lang === 'hi-IN' ? 'Hindi' : 'Bengali'}
              </button>
            ))}
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
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : 'Ask AI'}
            </button>
          </div>

          {/* AI Response */}
          {aiResponse && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800">AI Response:</h2>
              <p className="text-gray-700">{aiResponse}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Avtar;
