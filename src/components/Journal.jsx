import React from 'react'
 import { useState } from "react"
 import { generateAIResponse } from "../api/GeminiAi" // adjust path if needed

const Journal = () => {
  
    const [entries, setEntries] = useState([]);
    const [thought, setThought] = useState('');
    const [loading, setLoading] =useState(false);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!thought.trim())  return;

      setLoading(true);
      
      try{

        const aiReply = await generateAIResponse(thought);
        console.log(aiReply);
        const newEntry = {
            userEntry: thought,
            aiResponse: aiReply,
          };
          setEntries([newEntry, ...entries]);
          setThought(''); // Reset the textarea
      }
      catch(error){
        console.error('Error talking to AI:', error);
        alert('Oops! Something went wrong.');
      }

      setLoading(false);  
       
      
    };
  
    return (
      <section className="bg-white p-6 max-w-2xl mx-auto rounded-lg shadow-lg">
        {/* Journal Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-800">My Journal</h1>
          <p className="text-gray-600">Write your thoughts. Let your twin evolve.</p>
        </header>
  
        {/* Journal Input Section */}
        <section>
          <form onSubmit={handleSubmit}>
            <label htmlFor="journalEntry" className="block text-gray-700 mb-2">
              Today’s Thought:
            </label>
            <textarea
              id="journalEntry"
              name="journalEntry"
              rows="6"
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type here..."
              value={thought}
              onChange={(e) => setThought(e.target.value)}
            ></textarea>
            <button
              type="submit"
              className="mt-4 px-6 py-2  bg-gray-500 text-white rounded-lg hover:bg-gray-700 cursor-progress"
            >
              Submit Entry
            </button>
          </form>
        </section>
  
        {/* Journal Entries Display */}
        <section className="mt-8">
          <h2 className="text-3xl font-bold  text-gray-800 mb-4">Your Entries</h2>
          <div id="entries">
            {entries.map((entry, index) => (
              <div key={index} className="entry mb-6 p-4 border border-gray-200 rounded-lg">
                <p>
                  <strong>You:</strong> {entry.userEntry}
                </p>
                <p>
                  <strong>AI Twin:</strong> {entry.aiResponse}
                </p>
              </div>
            ))}
          </div>
        </section>
      </section>
);

  
}

export default Journal