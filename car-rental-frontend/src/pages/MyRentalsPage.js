// src/pages/MyRentalsPage.js
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const MyRentalsPage = () => {
  const { token, isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
 

  useEffect(() => {
    if (!isLoggedIn) {
      toast.info("Anda harus login untuk melihat riwayat penyewaan Anda.");
      navigate('/login');
      return;
    }

    const fetchMyRentals = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/rentals/me', {
          headers: {
            'Authorization': `Bearer ${token}` // Kirim JWT
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          const errorMessage = `Failed to fetch rentals: ${response.status} ${response.statusText}. Detail: ${errorText.substring(0, 100)}...`;
          throw new Error(errorMessage);
        }

        const data = await response.json();
        setRentals(data);
      } catch (err) {
        toast.error(err.message || 'Gagal memuat riwayat penyewaan Anda.');
        console.error("Error fetching my rentals:", err);
        setRentals([]); // Pastikan state direset ke array kosong saat error
      } finally {
        setLoading(false);
      }
    };

    fetchMyRentals();
  }, [token, isLoggedIn, navigate]); // Dependensi effect

  // *** FUNGSI BARU: Sewa Kembali ***
  const handleRentAgain = (carId) => {
    navigate(`/payment/${carId}`); // Arahkan ke halaman pembayaran dengan carId
  };

  if (loading) return <div className="text-center p-8">Memuat riwayat penyewaan...</div>;

  if (rentals.length === 0) return <div className="text-center p-8">Anda belum memiliki riwayat penyewaan.</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Riwayat Penyewaan Saya</h1>
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Rental</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobil</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mulai Sewa</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akhir Sewa</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Harga</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rentals.map((rental) => (
                <tr key={rental.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rental.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rental.car.brand} {rental.car.model}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rental.startDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rental.endDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp{rental.totalPrice}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      rental.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      rental.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      rental.status === 'PICKED_UP' ? 'bg-blue-100 text-blue-800' :
                      rental.status === 'OVERDUE' ? 'bg-red-300 text-red-900' :
                      rental.status === 'CANCELLED' ? 'bg-gray-400 text-gray-900' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {rental.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* *** TAMBAHKAN TOMBOL SEWA KEMBALI DI SINI *** */}
                    {/* Tampilkan tombol "Sewa Kembali" jika mobil tersedia dan rental sudah selesai atau dibatalkan */}
                    {(rental.status === 'RETURNED' || rental.status === 'COMPLETED' || rental.status === 'CANCELLED') && rental.car.available && (
                      <button
                        onClick={() => handleRentAgain(rental.car.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
                      >
                        Sewa Kembali
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyRentalsPage;