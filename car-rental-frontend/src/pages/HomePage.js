// src/pages/HomePage.js
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const HomePage = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // --- STATE BARU UNTUK PAGINASI ---
  const [currentPage, setCurrentPage] = useState(0); // Halaman saat ini (0-indexed)
  const [totalPages, setTotalPages] = useState(0); // Total halaman dari backend
  const [totalElements, setTotalElements] = useState(0); // Total elemen dari backend
  const [pageSize, setPageSize] = useState(10); // Ukuran halaman (sesuai @PageableDefault di backend)

  const fetchCars = useCallback(async (currentSearchTerm, currentFilterAvailable, page, size) => { // Tambahkan page, size
    setLoading(true);
    setError(null);
    const url = `http://localhost:8080/api/cars?search=${currentSearchTerm || ''}&available=${currentFilterAvailable || ''}&page=${page}&size=${size}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          errorMessage = await response.text();
          errorMessage = `Server error (${response.status}): ${errorMessage.substring(0, 100)}...`;
        }
        throw new Error(errorMessage);
      }
      // *** MENANGANI RESPONS PAGE DARI BACKEND ***
      const pageData = await response.json(); // Backend mengembalikan objek Page
      setCars(pageData.content); // Data mobil ada di properti 'content'
      setTotalPages(pageData.totalPages);
      setTotalElements(pageData.totalElements);
      setCurrentPage(pageData.number); // Nomor halaman yang benar dari backend
    } catch (err) {
      setError("Gagal memuat daftar mobil.");
      toast.error(err.message || "Gagal memuat daftar mobil.");
      console.error("Error fetching cars:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => { clearTimeout(timerId); };
  }, [searchTerm]);

  useEffect(() => {
    // Panggil fetchCars dengan parameter paginasi
    fetchCars(debouncedSearchTerm, filterAvailable, currentPage, pageSize);
  }, [debouncedSearchTerm, filterAvailable, currentPage, pageSize, fetchCars]); // Tambahkan currentPage, pageSize ke deps

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0); // Reset ke halaman pertama saat pencarian/filter berubah
  };

  const handleFilterAvailableChange = (e) => {
    setFilterAvailable(e.target.checked);
    setCurrentPage(0); // Reset ke halaman pertama saat pencarian/filter berubah
  };

  // --- HANDLER UNTUK TOMBOL PAGINASI ---
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Ubah tampilan loading dan error agar lebih responsif
  if (loading) return <div className="text-center p-8">Memuat mobil...</div>;
  if (error && cars.length === 0) return <div className="text-center p-8 text-red-500">{error}</div>;

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
        <> {/* Gunakan Fragment untuk membungkus grid dan paginasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <div key={car.id} className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300">
                <Link to={`/cars/${car.id}`}>
                  {car.imageUrl ? (
                    <img src={`http://localhost:8080${car.imageUrl}`} alt={`${car.brand} ${car.model}`} className="w-full h-48 object-cover"/>
                  ) : (
                    <img src={`https://via.placeholder.com/400x250?text=${car.brand}+${car.model}`} alt={`${car.brand} ${car.model}`} className="w-full h-48 object-cover"/>
                  )}
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

          {/* *** KONTROL PAGINASI *** */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i)}
                  className={`px-4 py-2 rounded-md ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
              >
                Next
              </button>
              <p className="ml-4 text-gray-700">Total: {totalElements} mobil</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;