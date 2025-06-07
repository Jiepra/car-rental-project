// src/components/Navbar.js
import React, { useContext, useState } from 'react'; // Import useState
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { isLoggedIn, username, logout, isAdmin } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false); // State untuk mengelola tampilan menu mobile

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Rental Mobil</Link>

        {/* Hamburger menu icon for mobile */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-white focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
            </svg>
          </button>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-4"> {/* hidden di mobile, flex di md ke atas */}
          <Link to="/" className="px-3 py-2 hover:bg-gray-700 rounded-md">Home</Link>
          {isLoggedIn ? (
            <>
              {isAdmin && (
                 <Link to="/dashboard" className="px-3 py-2 hover:bg-gray-700 rounded-md">Dashboard</Link>
              )}
              <Link to="/my-rentals" className="px-3 py-2 hover:bg-gray-700 rounded-md">Riwayat Sewa</Link>
              <span className="px-3 py-2">Halo, {username}!</span>
              <button
                onClick={logout}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md ml-2"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 hover:bg-gray-700 rounded-md">Login</Link>
              <Link to="/register" className="px-3 py-2 hover:bg-gray-700 rounded-md">Daftar</Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu (toggled by isOpen state) */}
      {isOpen && (
        <div className="md:hidden mt-4">
          <div className="flex flex-col space-y-2">
            <Link to="/" className="block px-3 py-2 hover:bg-gray-700 rounded-md" onClick={toggleMenu}>Home</Link>
            {isLoggedIn ? (
              <>
                {isAdmin && (
                   <Link to="/dashboard" className="block px-3 py-2 hover:bg-gray-700 rounded-md" onClick={toggleMenu}>Dashboard</Link>
                )}
                <Link to="/my-rentals" className="block px-3 py-2 hover:bg-gray-700 rounded-md" onClick={toggleMenu}>Riwayat Sewa</Link>
                <span className="block px-3 py-2">Halo, {username}!</span>
                <button
                  onClick={() => { logout(); toggleMenu(); }}
                  className="block px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md text-left w-full"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 hover:bg-gray-700 rounded-md" onClick={toggleMenu}>Login</Link>
                <Link to="/register" className="block px-3 py-2 hover:bg-gray-700 rounded-md" onClick={toggleMenu}>Daftar</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;