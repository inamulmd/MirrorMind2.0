import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useMirror } from '../context/MirrorContext'; // Assuming MirrorContext is used to share state
import { generateAIResponse } from '../api/GeminiAi';

const Timeline = () => {
  const [year, setYear] = useState('2024');
  const [timelineText, setTimelineText] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [yesterdayResponse, setYesterdayResponse] = useState('');

  const { messages, addMessage } = useMirror();

  useEffect(() => {
    // Simulate AI response for yesterday and today
    const fetchTimelineData = async () => {
      try {
        // Fetch timeline data
        const response = await axios.get(`/timeline?year=${year}`);
        setTimelineText(response.data.responseText);

        // Get AI response for 'Yesterday' (this can be dynamic or historical)
        const yesterdayResponse = await generateAIResponse('Tell me about yesterday!');
        setYesterdayResponse(yesterdayResponse); // Store the 'Yesterday' response

        // Generate avatar
        setAvatarLoading(true);
        const avatarResponse = await axios.post('/generate-avatar', { description: `AI twin for the year ${year}` });
        setAvatarUrl(avatarResponse.data.avatarUrl);
      } catch (error) {
        console.error('Error fetching timeline or generating avatar:', error);
      } finally {
        setAvatarLoading(false);
      }
    };

    fetchTimelineData();
  }, [year]);

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  const handleUserInputChange = (event) => {
    setUserInput(event.target.value);
  };

  const handleSubmit = async () => {
    if (userInput.trim()) {
      try {
        addMessage('user', userInput);

        // Get AI response for "Now"
        const response = await generateAIResponse(userInput);
        setAiResponse(response); // Store "Now" response

        // Update timeline text with both responses (Yesterday and Now)
        setTimelineText(`You in ${year}: ${response}`);
        addMessage('ai', response);
      } catch (error) {
        console.error('Error generating AI response:', error);
        setAiResponse('Sorry, I could not generate a response.');
      }

      setUserInput(''); // Clear input field
    }
  };

  return (
    <div className="timeline-container bg-gray-100 min-h-screen flex flex-col items-center">
      <header className="timeline-header text-center py-10 bg-gradient-to-r from-blue-500 to-indigo-600 text-white w-full">
        <h1 className="text-4xl font-bold mb-2">MirrorMind Timeline</h1>
        <p className="text-lg">Explore your evolution through time</p>
      </header>

      {/* Timeline Slider */}
      <section className="timeline-slider mt-8 w-full max-w-lg px-6">
        <label htmlFor="timelineRange" className="block text-xl font-semibold text-gray-700 mb-2">Select Year:</label>
        <div className="flex items-center justify-between">
          <input
            type="range"
            id="timelineRange"
            name="timelineRange"
            min="2023"
            max="2025"
            step="1"
            value={year}
            onChange={handleYearChange}
            className="w-full h-2 bg-blue-300 rounded-lg"
          />
          <span className="ml-3 text-xl font-medium text-gray-800">{year}</span>
        </div>
      </section>

      {/* Timeline Display */}
      <section className="twin-comparison mt-8 w-full max-w-4xl px-6">
        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">Me in <span className="text-blue-600">{year}</span></h2>
        <div className="flex flex-wrap justify-between gap-8">
          <div className="version bg-white p-6 rounded-lg shadow-lg w-full md:w-[48%]">
            <h3 className="text-xl font-bold text-gray-800 mb-3">You Then (Yesterday)</h3>
            <p className="text-gray-600">{yesterdayResponse || 'Loading yesterday’s response...'}</p>
          </div>
          <div className="version bg-white p-6 rounded-lg shadow-lg w-full md:w-[48%]">
            <h3 className="text-xl font-bold text-gray-800 mb-3">You Now</h3>
            <p className="text-gray-600">{aiResponse || '“I am evolving through time.”'}</p>
          </div>
        </div>
      </section>

      {/* Avatar Section */}
      <section className="avatar-section mt-10 w-full max-w-lg px-6 text-center">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Your AI Twin Avatar</h3>
        <div className={`avatar-3d ${avatarLoading ? 'animate-pulse' : ''}`}>
          {avatarLoading ? (
            <div className="text-gray-500">Generating avatar...</div>
          ) : avatarUrl ? (
            <img src={avatarUrl} alt="AI Avatar" className="w-48 h-48 rounded-full object-cover border-4 border-blue-500 shadow-xl" />
          ) : (
            <p className="text-red-500">No avatar generated yet.</p>
          )}
        </div>
      </section>

      {/* User Input Section */}
      <section className="user-input-section mt-8 w-full max-w-lg px-6">
        <div className="input-container">
          <label htmlFor="userInput" className="block text-xl font-semibold text-gray-700 mb-2">Your Input:</label>
          <input
            type="text"
            id="userInput"
            value={userInput}
            onChange={handleUserInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Ask me something..."
          />
          <button
            onClick={handleSubmit}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Submit
          </button>
        </div>
      </section>

      {/* Conversation History */}
      <section className="mt-8 w-full max-w-lg px-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Your Conversation</h3>
        <div className="bg-white rounded-lg shadow p-4 space-y-2 max-h-60 overflow-y-auto">
          {[...messages].reverse().map((msg, idx) => (
            <div key={idx} className="text-gray-700">
              <strong>{msg.sender === 'user' ? 'You' : 'AI'}:</strong> {msg.text}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Timeline;
