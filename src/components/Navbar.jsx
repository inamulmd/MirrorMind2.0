import React from 'react'
import { NavLink } from 'react-router-dom';
import { useState } from "react"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <nav className="bg-gray-800 p-4">
    <div className="relative w-[1080px] ml-52 flex  justify-center items-center space-x-5.5">
      <NavLink
        to="/home"
        className={({ isActive }) =>
          `text-xl font-bold ${isActive ? 'text-yellow-400' : 'text-white hover:text-gray-300'}`
        }
      >
        Home
      </NavLink>

      <div className="hidden md:flex space-x-4">
        <NavLink
          to="/journal"
          className={({ isActive }) =>
            isActive ? 'text-yellow-400' : 'text-white hover:text-gray-300'
          }
        >
          Journal
        </NavLink>

        <NavLink
          to="/timeline"
          className={({ isActive }) =>
            isActive ? 'text-yellow-400' : 'text-white hover:text-gray-300'
          }
        >
          Timeline
        </NavLink>

        <NavLink
          to="/avtar"
          className={({ isActive }) =>
            isActive ? 'text-yellow-400' : 'text-white hover:text-gray-300'
          }
        >
          AI Twin
        </NavLink>
      </div>
    </div>

    {/* Optional Mobile Menu Button */}
    <div className="md:hidden relative">
  <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
    Menu
  </button>
  {isMenuOpen && (
    <div className="absolute bg-gray-700 p-2 rounded mt-2">
      <NavLink to="/journal" className="block text-white mb-2">Journal</NavLink>
      <NavLink to="/timeline" className="block text-white mb-2">Timeline</NavLink>
      <NavLink to="/avatar" className="block text-white">AI Twin</NavLink>
     </div>
    )}
   </div>
  </nav>
  );
}

export default Navbar
