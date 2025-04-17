import React, { useState, useEffect } from 'react';
import { generateAIResponse } from '../api/GeminiAi';
import { generateAvatarImage } from '../api/ImageApi';
import { useMirror } from '../context/MirrorContext';
import { auth } from '../components/firebase';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Avtar = () => {
  const navigate = useNavigate();
  const { addMessage } = useMirror();

  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [language, setLanguage] = useState('hi-IN');
  const [voices, setVoices] = useState([]);
  const [userGender, setUserGender] = useState(null);

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [conversation, setConversation] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) navigate('/login');
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const voicesList = synth.getVoices();
      if (voicesList.length > 0) {
        setVoices(voicesList);
        console.log('Voices loaded:', voicesList);
      } else {
        setTimeout(loadVoices, 500); // Retry until voices are available
      }
    };

    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }

    detectUserGenderByVoice();
  }, []);

  useEffect(() => {
    if (userInput.trim()) generateAvatar(userInput);
  }, [userInput]);

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
    const languageMap = {
      'en-US': 'Respond in English using the Latin script.',
      'hi-IN': 'Respond in Hindi using the Devanagari script.',
      'bn-IN': 'Respond in Bengali using the Bengali script.',
    };

    try {
      const response = await generateAIResponse(
        `${languageMap[language]} Here's the user's message: "${input}"`
      );

      setAiResponse(response);
      setConversation((prev) => [...prev, { user: input, ai: response }]);
      addMessage({ user: input, ai: response });

      // Ensure voices are loaded before speaking
      if (voices.length === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      speak(response, language);
    } catch (error) {
      console.error('Error generating AI response:', error);
      setAiResponse("Oops, I couldn't respond right now.");
    }
  };

  const speak = (text, language) => {
    const synth = window.speechSynthesis;
    const availableVoices = synth.getVoices();

    const languageVoices = availableVoices.filter((v) => v.lang === language);
    let selectedVoice;

    if (userGender && languageVoices.length > 0) {
      selectedVoice =
        userGender === 'male'
          ? languageVoices.find((v) => v.name.toLowerCase().includes('male')) || languageVoices[0]
          : languageVoices.find((v) => v.name.toLowerCase().includes('female')) || languageVoices[0];
    }

    if (!selectedVoice) {
      selectedVoice =
        languageVoices[0] ||
        availableVoices.find((v) => v.lang.startsWith(language.split('-')[0])) ||
        availableVoices[0];
    }

    if (!selectedVoice) {
      console.error('No suitable voice found');
      return;
    }

    const utter = new SpeechSynthesisUtterance(text);
    utter.voice = selectedVoice;
    utter.lang = selectedVoice.lang;
    utter.pitch = 1.1;
    utter.rate = 0.95;

    synth.cancel();
    synth.speak(utter);
    console.log('Speaking with:', selectedVoice.name);
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

        if (average < 10) return;

        const isMale = average < 30;
        setUserGender(isMale ? 'male' : 'female');
        stream.getTracks().forEach((track) => track.stop());
      };

      setTimeout(detectPitch, 2000);
    } catch (error) {
      console.error('Voice detection error:', error);
    }
  };

  const handleSend = async (input) => {
    const query = input || userInput.trim();
    if (!query) return;

    setLoading(true);
    try {
      await handleResponseInRequestedLanguage(query);
    } catch (error) {
      console.error('Error handling response:', error);
    }
    setLoading(false);
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

    recognition.onend = () => setListening(false);
  };

  return (
    <div>
      <Navbar />
      <div className="bg-white text-gray-800 min-h-screen">
        <header className="text-center py-10 bg-gray-100">
          <h1 className="text-4xl font-bold mb-2">Your AI Twin</h1>
          <p className="text-lg text-gray-600">Talk to your evolving self</p>
        </header>

        <section className="flex flex-col items-center py-10 space-y-4">
          <div onClick={startListening} className="cursor-pointer">
            {avatarLoading ? (
              <p className="text-gray-500">Generating avatar...</p>
            ) : avatarUrl ? (
              <img src={avatarUrl} alt="AI Avatar" className="w-48 h-48 rounded-full object-cover border-4 shadow-lg" />
            ) : (
              <p className="text-red-500">Failed to load avatar</p>
            )}
          </div>
          <p className="mt-6 text-xl text-center max-w-md font-medium text-gray-700">
            {listening ? '🎙️ Listening...' : "“I evolve by listening to you. Let's talk.”"}
          </p>
        </section>

        <section className="bg-gray-50 py-8 px-4">
          <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-6">
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

            <div>
              <label htmlFor="input" className="block text-gray-700 font-medium mb-2">Speak your mind:</label>
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

            {aiResponse && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800">AI Response:</h2>
                <p className="text-gray-700">{aiResponse}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Avtar;
