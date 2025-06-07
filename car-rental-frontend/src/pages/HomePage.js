// src/pages/HomePage.js
import React, { useEffect, useState, useCallback } from 'react'; // Import useCallback
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify'; // Import toast

const HomePage = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Keep error state for initial load error
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const fetchCars = useCallback(async (currentSearchTerm, currentFilterAvailable) => {
    setLoading(true);
    setError(null); // Clear error on new fetch
    let url = 'http://localhost:8080/api/cars';
    const params = new URLSearchParams();

    if (currentSearchTerm) {
      params.append('search', currentSearchTerm);
    }
    if (currentFilterAvailable) {
      params.append('available', 'true');
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCars(data);
    } catch (err) {
      // Use toast for specific action errors, keep error state for general fetch error display
      setError("Gagal memuat daftar mobil.");
      toast.error(err.message || "Gagal memuat daftar mobil."); // Toast untuk feedback cepat
      console.error("Error fetching cars:", err);
    } finally {
      setLoading(false);
    }
  }, []); // dependencies are empty because values are passed as args

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  useEffect(() => {
    fetchCars(debouncedSearchTerm, filterAvailable);
  }, [debouncedSearchTerm, filterAvailable, fetchCars]); // Tambahkan fetchCars ke deps

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterAvailableChange = (e) => {
    setFilterAvailable(e.target.checked);
  };

  // Ubah tampilan loading dan error agar lebih responsif
  if (loading) return <div className="text-center p-8">Memuat mobil...</div>;
  if (error && cars.length === 0) return <div className="text-center p-8 text-red-500">{error}</div>; // Tampilkan error jika tidak ada mobil yang berhasil dimuat

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-8">Daftar Mobil Tersedia</h1>

      {/* Bagian Pencarian dan Filter */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-2xl mx-auto flex flex-col md:flex-row gap-4 justify-center items-center">
        <input
          type="text"
          placeholder="Cari merek atau model..."
          className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <div className="flex items-center">
          <input
            type="checkbox"
            id="filterAvailable"
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            checked={filterAvailable}
            onChange={handleFilterAvailableChange}
          />
          <label htmlFor="filterAvailable" className="ml-2 text-gray-700">Tersedia Saja</label>
        </div>
      </div>

      {cars.length === 0 && !loading && !error ? (
          <p className="text-center text-lg text-gray-600">Tidak ada mobil yang ditemukan sesuai kriteria Anda.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* <-- UBAH GRID INI */}
          {cars.map((car) => (
            <div key={car.id} className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300">
              <Link to={`/cars/${car.id}`}>
                <img src={`https://via.placeholder.com/400x250?text=${car.brand}+${car.model}`} alt={`${car.brand} ${car.model}`} className="w-full h-48 object-cover"/>
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">{car.brand} {car.model} ({car.year})</h2>
                  <p className="text-gray-700 mb-2">Plat Nomor: {car.licensePlate}</p>
                  <p className="text-gray-900 font-bold text-lg mb-4">Rp{car.dailyRate} / Hari</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${car.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {car.available ? 'Tersedia' : 'Tidak Tersedia'}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;