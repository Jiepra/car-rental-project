// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

// Buat AuthContext
export const AuthContext = createContext();

// Buat AuthProvider untuk membungkus komponen yang membutuhkan akses ke konteks
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);

  // Muat token dan info user dari localStorage saat aplikasi pertama kali dimuat
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('role');

    if (storedToken && storedUsername && storedRole) {
      setToken(storedToken);
      setUsername(storedUsername);
      setRole(storedRole);
    }
  }, []);

  // Fungsi untuk login
  const login = (newToken, newUsername, newRole) => {
    setToken(newToken);
    setUsername(newUsername);
    setRole(newRole);
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', newUsername);
    localStorage.setItem('role', newRole);
  };

  // Fungsi untuk logout
  const logout = () => {
    setToken(null);
    setUsername(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
  };

  // Objek value yang akan tersedia di seluruh aplikasi
  const authContextValue = {
    token,
    username,
    role,
    isLoggedIn: !!token, // Boolean untuk mengecek apakah user sudah login
    isAdmin: role === 'ADMIN', // Helper untuk mengecek apakah user admin
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};