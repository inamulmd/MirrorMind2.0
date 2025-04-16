import React from 'react'

const Home = () => {
  return (
 <div className="homebar w-full h-full">
     <section className=" t py-12">
    <h1 className=" text-amber-50 text-center justify-center items-center text-6xl  mb-4">Welcome to MirrorMind</h1>
    <p className="text-lg text-amber-50">Start your journey with your AI twin!</p>
     </section>

     <section>
         <h2>Not a chatbot. It’s you — evolved.</h2>
         <p>Feed it your thoughts, moods, voice. Watch it grow with you.</p>
         <button>Start Journaling</button>
      </section> 

      {/* <!-- Features Section --> */}
     <section>
        <h3>What MirrorMind Can Do</h3>
       <ul>
         <li>Talk with your AI Twin</li>
         <li>Ask what “you” would do</li>
          <li>See how you change over time</li>
        </ul>
      </section>

 </div>
  )
}

export default Home