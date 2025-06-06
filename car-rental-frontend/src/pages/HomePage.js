// src/pages/HomePage.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvailable, setFilterAvailable] = useState(false);

  // *** STATE BARU UNTUK DEBOUNCE SEARCH TERM ***
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const fetchCars = async (currentSearchTerm, currentFilterAvailable) => { // Terima parameter
    setLoading(true);
    setError(null);
    let url = 'http://localhost:8080/api/cars';
    const params = new URLSearchParams();

    if (currentSearchTerm) { // Gunakan currentSearchTerm dari parameter
      params.append('search', currentSearchTerm);
    }
    if (currentFilterAvailable) { // Gunakan currentFilterAvailable dari parameter
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
      setError("Gagal memuat daftar mobil.");
      console.error("Error fetching cars:", err);
    } finally {
      setLoading(false);
    }
  };

  // *** EFFECT UNTUK DEBOUNCING SEARCH TERM ***
  useEffect(() => {
    // Set a timeout to update the debounced search term after 500ms
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Debounce delay 500ms (0.5 detik)

    // Cleanup function: clear the timeout if searchTerm changes before 500ms
    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]); // Only re-run this effect when searchTerm changes

  // *** EFFECT UTAMA UNTUK FETCH DATA, SEKARANG TERGANTUNG PADA DEBOUNCED SEARCH TERM ***
  useEffect(() => {
    fetchCars(debouncedSearchTerm, filterAvailable); // Panggil fetchCars dengan debounced term
  }, [debouncedSearchTerm, filterAvailable]); // Hanya re-run when debouncedSearchTerm or filterAvailable changes


  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value); // Update searchTerm immediately
  };

  const handleFilterAvailableChange = (e) => {
    setFilterAvailable(e.target.checked); // FilterAvailable tidak perlu debounce karena biasanya click
  };

  if (loading) return <div className="text-center p-8">Memuat mobil...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-8">Daftar Mobil Tersedia</h1>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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