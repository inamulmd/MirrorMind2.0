// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Journal from './components/Journal';
import Timeline from './components/Timeline';
import Avtar from './components/Avtar';


const App = () => {
  return (
    
    <div>
        <Navbar />
        
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/avatar" element={<Avtar />} />
      </Routes>
    </div>
     
    
  );
};

export default App;
