// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Ambil nilai awal dari sessionStorage, atau null jika tidak ada
  // Ini akan mencegah logout saat refresh jika token sudah ada
  const [token, setToken] = useState(sessionStorage.getItem('token') || null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!sessionStorage.getItem('token')); // Konversi string/null ke boolean
  const [isAdmin, setIsAdmin] = useState(false); // Default false
  const [username, setUsername] = useState(null); // Default null

  // Fungsi untuk mendekode token dan mengatur state user info
  const decodeToken = (jwtToken) => {
    if (!jwtToken) return;
    try {
      const decoded = jwtDecode(jwtToken);
      // Asumsi role dan sub (username) ada di payload token
      setIsAdmin(decoded.role === 'ADMIN');
      setUsername(decoded.sub);
    } catch (error) {
      console.error("Failed to decode JWT:", error);
      // Jika token tidak valid, bersihkan saja
      clearAuth();
    }
  };

  // Fungsi untuk membersihkan state otentikasi
  const clearAuth = () => {
    setToken(null);
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUsername(null);
    sessionStorage.removeItem('token'); // Hapus dari local storage
  };

  // Efek untuk memuat token dan informasi user saat komponen pertama kali di-mount
  // atau saat token berubah (misalnya setelah login/logout)
  useEffect(() => {
    if (token) {
      decodeToken(token);
      setIsLoggedIn(true);
      sessionStorage.setItem('token', token); // Pastikan token selalu di-sync dengan sessionStorage
    } else {
      clearAuth(); // Jika token di state null, pastikan sessionStorage juga bersih
    }
  }, [token]); // Jalankan efek ini setiap kali token berubah

  // Fungsi login yang menyimpan token ke local storage
  const login = (jwtToken) => {
    setToken(jwtToken);
    sessionStorage.setItem('token', jwtToken); // Simpan token ke local storage
    decodeToken(jwtToken); // Dekode untuk update isAdmin dan username
  };

  // Fungsi logout yang menghapus token dari local storage
  const logout = () => {
    clearAuth(); // Membersihkan semua state dan sessionStorage
  };

  return (
    <AuthContext.Provider value={{ token, isLoggedIn, isAdmin, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};