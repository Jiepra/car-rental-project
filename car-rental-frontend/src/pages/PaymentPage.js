// src/pages/PaymentPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useParams dan useNavigate
import { AuthContext } from '../context/AuthContext'; // Import AuthContext

const PaymentPage = () => {
  const { carId } = useParams(); // Ambil carId dari URL
  const navigate = useNavigate();
  const { token, isLoggedIn } = useContext(AuthContext);

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rentalSuccess, setRentalSuccess] = useState(null);

  // Form state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [numberOfDays, setNumberOfDays] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) {
      alert("Anda harus login untuk mengakses halaman pembayaran.");
      navigate('/login');
      return;
    }

    const fetchCarDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/cars/${carId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch car details: ${response.statusText}`);
        }
        const data = await response.json();
        setCar(data);
        if (!data.available) {
          alert("Mobil ini tidak tersedia untuk disewa.");
          navigate('/'); // Kembali ke home jika mobil tidak tersedia
        }
      } catch (err) {
        setError(err.message || "Gagal memuat detail mobil.");
        console.error("Error fetching car details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (carId) {
      fetchCarDetails();
    }
  }, [carId, isLoggedIn, navigate]);

  useEffect(() => {
    if (car && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 untuk inklusif
      if (diffDays > 0) {
        setNumberOfDays(diffDays);
        setTotalPrice(car.dailyRate * diffDays);
      } else {
        setNumberOfDays(0);
        setTotalPrice(0);
      }
    } else {
      setNumberOfDays(0);
      setTotalPrice(0);
    }
  }, [car, startDate, endDate]);


  const handleRentSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setRentalSuccess(null);

    if (!car || !startDate || !endDate || numberOfDays <= 0) {
      setError("Mohon lengkapi detail sewa dan pastikan tanggal valid.");
      return;
    }
    if (new Date(startDate) < new Date()) {
      setError("Tanggal mulai tidak boleh di masa lalu.");
      return;
    }

    try {
      const rentalRequest = {
        carId: car.id,
        startDate,
        endDate,
      };

      const response = await fetch('http://localhost:8080/api/rentals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Kirim JWT
        },
        body: JSON.stringify(rentalRequest),
      });

      if (response.ok) {
        setRentalSuccess('Penyewaan berhasil diproses! Silakan tunggu konfirmasi.');
        // Opsi: Arahkan ke halaman riwayat pesanan atau home
        setTimeout(() => {
          navigate('/my-rentals'); // Arahkan ke dashboard (atau halaman riwayat rental)
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Gagal memproses penyewaan. Mohon coba lagi.');
        console.error('Failed to create rental:', errorData);
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan atau server saat memproses penyewaan.');
      console.error('Network error creating rental:', err);
    }
  };

  if (loading) return <div className="text-center p-8">Memuat detail mobil...</div>;
  if (error && !car) return <div className="text-center p-8 text-red-500">{error}</div>; // Hanya tampilkan error jika mobil belum dimuat

  if (!car) return <div className="text-center p-8">Mobil tidak ditemukan atau tidak tersedia.</div>;


  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Detail Pembayaran Sewa Mobil</h1>
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        {rentalSuccess && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{rentalSuccess}</div>}
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}

        <h2 className="text-2xl font-semibold mb-4">Ringkasan Pesanan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="font-semibold">Mobil:</p>
            <p>{car.brand} {car.model} ({car.year})</p>
          </div>
          <div>
            <p className="font-semibold">Plat Nomor:</p>
            <p>{car.licensePlate}</p>
          </div>
          <div>
            <p className="font-semibold">Harga Harian:</p>
            <p>Rp{car.dailyRate}</p>
          </div>
          <div className="md:col-span-2">
            <p className="font-semibold text-lg">Total Harga: <span className="text-green-600">Rp{totalPrice}</span> ({numberOfDays} hari)</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Detail Sewa & Pembayaran</h2>
        <form onSubmit={handleRentSubmit} className="space-y-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Tanggal Mulai Sewa</label>
            <input
              type="date"
              id="startDate"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Tanggal Selesai Sewa</label>
            <input
              type="date"
              id="endDate"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
          {/* Bagian untuk detail pembayaran kartu (placeholder) */}
          <h3 className="text-xl font-semibold mt-6 mb-2">Informasi Pembayaran (Placeholder)</h3>
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">Nomor Kartu</label>
            <input type="text" id="cardNumber" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="XXXX XXXX XXXX XXXX" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">Tanggal Kedaluwarsa</label>
              <input type="text" id="expiryDate" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="MM/YY" />
            </div>
            <div>
              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">CVV</label>
              <input type="text" id="cvv" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="XXX" />
            </div>
          </div>
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition duration-300">
            Konfirmasi & Bayar
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;