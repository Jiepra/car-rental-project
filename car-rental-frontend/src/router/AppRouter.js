// src/router/AppRouter.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import PaymentPage from '../pages/PaymentPage';
import DashboardPage from '../pages/DashboardPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import MyRentalsPage from '../pages/MyRentalsPage';
import CarDetailPage from '../pages/CarDetailPage'; // Import CarDetailPage
import Navbar from '../components/Navbar';
import PrivateRoute from './PrivateRoute';

import { AuthProvider } from '../context/AuthContext';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AppRouter = () => {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <main className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/cars/:id" element={<CarDetailPage />} /> {/* <-- TAMBAH RUTE INI */}

            <Route path="/payment/:carId" element={
              <PrivateRoute>
                <PaymentPage />
              </PrivateRoute>
            } />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            } />
            <Route path="/my-rentals" element={
              <PrivateRoute>
                <MyRentalsPage />
              </PrivateRoute>
            } />
            {/* Tambahkan rute lain jika diperlukan */}
          </Routes>
        </main>
        <ToastContainer
          position="top-right" // Posisi notifikasi
          autoClose={5000} // Otomatis tutup setelah 5 detik
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthProvider>
    </Router>
  );
};

export default AppRouter;