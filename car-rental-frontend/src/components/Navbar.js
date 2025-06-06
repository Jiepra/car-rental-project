// src/components/Navbar.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { isLoggedIn, username, logout, isAdmin } = useContext(AuthContext);

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Rental Mobil</Link>
        <div>
          <Link to="/" className="px-3 py-2 hover:bg-gray-700 rounded-md">Home</Link>
          {isLoggedIn ? (
            <>
              {isAdmin && (
                 <Link to="/dashboard" className="px-3 py-2 hover:bg-gray-700 rounded-md">Dashboard</Link>
              )}
              {/* <Link to="/payment" className="px-3 py-2 hover:bg-gray-700 rounded-md">Payment</Link> */}
              <Link to="/my-rentals" className="px-3 py-2 hover:bg-gray-700 rounded-md">Riwayat Sewa</Link> {/* <-- TAMBAH LINK INI */}
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
    </nav>
  );
};

export default Navbar;