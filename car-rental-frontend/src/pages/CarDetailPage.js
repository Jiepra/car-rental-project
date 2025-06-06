// src/pages/CarDetailPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Import Link
import { AuthContext } from '../context/AuthContext';

const CarDetailPage = () => {
  const { id } = useParams(); // Ambil ID mobil dari URL
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext);

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/cars/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch car details: ${response.statusText}`);
        }
        const data = await response.json();
        setCar(data);
      } catch (err) {
        setError(err.message || "Gagal memuat detail mobil.");
        console.error("Error fetching car details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCarDetails();
    }
  }, [id]); // Dependensi effect

  const handleRentClick = () => {
    if (isLoggedIn) {
      navigate(`/payment/${car.id}`); // Arahkan ke halaman pembayaran dengan ID mobil
    } else {
      alert("Anda harus login untuk menyewa mobil.");
      navigate('/login'); // Arahkan ke halaman login
    }
  };

  if (loading) return <div className="text-center p-8">Memuat detail mobil...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
  if (!car) return <div className="text-center p-8">Mobil tidak ditemukan.</div>; // Jika car null setelah loading selesai

  return (
    <div className="container mx-auto p-8">
      <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Kembali ke Daftar Mobil</Link>
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="md:w-1/2">
          <img
            src={`https://via.placeholder.com/600x400?text=${car.brand}+${car.model}`}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-auto object-cover rounded-lg shadow-md"
          />
        </div>
        <div className="md:w-1/2">
          <h1 className="text-4xl font-bold mb-4">{car.brand} {car.model} ({car.year})</h1>
          <p className="text-xl text-gray-700 mb-2">Plat Nomor: <span className="font-semibold">{car.licensePlate}</span></p>
          <p className="text-xl text-gray-700 mb-4">Harga Harian: <span className="font-bold text-green-600">Rp{car.dailyRate}</span></p>

          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Deskripsi</h2>
            <p className="text-gray-600">
              {/* Ini adalah placeholder, Anda bisa menambahkan field deskripsi di entitas Car jika mau */}
              Mobil {car.brand} {car.model} tahun {car.year} adalah pilihan sempurna untuk kebutuhan perjalanan Anda.
              Dengan plat nomor {car.licensePlate}, mobil ini siap mengantarkan Anda ke berbagai destinasi.
              Kenyamanan dan performa terbaik di kelasnya.
            </p>
          </div>

          <p className="text-lg mb-6">
            Status: <span className={`font-semibold ${car.available ? 'text-green-600' : 'text-red-600'}`}>
              {car.available ? 'Tersedia' : 'Tidak Tersedia'}
            </span>
          </p>

          {car.available ? (
            <button
              onClick={handleRentClick}
              className="w-full py-3 bg-blue-600 text-white text-lg font-semibold rounded-md hover:bg-blue-700 transition duration-300"
            >
              Sewa Sekarang
            </button>
          ) : (
            <button
              disabled
              className="w-full py-3 bg-gray-400 text-white text-lg font-semibold rounded-md cursor-not-allowed"
            >
              Tidak Tersedia
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarDetailPage;