// src/pages/DashboardPage.js
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const DashboardPage = () => {
  const { isLoggedIn, isAdmin, token, username: loggedInUsername } = useContext(AuthContext); // Dapatkan username yang sedang login

  // State for Add Car Form
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [available, setAvailable] = useState(true);

  // State for Edit Car Form
  const [editingCar, setEditingCar] = useState(null); // Menyimpan objek mobil yang sedang diedit
  const [editBrand, setEditBrand] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editLicensePlate, setEditLicensePlate] = useState('');
  const [editDailyRate, setEditDailyRate] = useState('');
  const [editAvailable, setEditAvailable] = useState(true);

  // State for Car List
  const [cars, setCars] = useState([]);
  const [loadingCars, setLoadingCars] = useState(true); // Ganti nama state loading agar lebih spesifik

  // State for User Management List
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true); // State loading untuk daftar user


  // Global Message States
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // --- Fetching Data Functions ---
  const fetchCars = async () => {
    setLoadingCars(true); // Gunakan loadingCars
    setError(null);
    try {
      const response = await fetch('http://localhost:8080/api/cars', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch cars: ${response.statusText}`);
      }
      const data = await response.json();
      setCars(data);
    } catch (err) {
      setError(err.message || 'Gagal memuat daftar mobil.');
      console.error("Error fetching cars for dashboard:", err);
    } finally {
      setLoadingCars(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true); // Gunakan loadingUsers
    setError(null); // Gunakan error state umum, atau buat terpisah jika mau
    try {
      const response = await fetch('http://localhost:8080/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Gagal memuat daftar pengguna.');
      console.error("Error fetching users for dashboard:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // --- useEffect for Initial Data Load ---
  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      fetchCars();
      fetchUsers(); // Panggil fetchUsers juga
    }
  }, [isLoggedIn, isAdmin, token]);


  // --- Car Management Handlers ---
  const handleAddCar = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!brand || !model || !year || !licensePlate || !dailyRate) {
      setError('Semua kolom harus diisi.');
      return;
    }
    if (isNaN(dailyRate) || parseFloat(dailyRate) <= 0) {
      setError('Harga Harian harus angka positif.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/cars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          brand,
          model,
          year,
          licensePlate,
          dailyRate: parseFloat(dailyRate),
          available,
        }),
      });

      if (response.ok) {
        setSuccess('Mobil berhasil ditambahkan!');
        // Reset form
        setBrand('');
        setModel('');
        setYear('');
        setLicensePlate('');
        setDailyRate('');
        setAvailable(true);
        fetchCars(); // Refresh daftar mobil
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Gagal menambahkan mobil.');
        console.error('Failed to add car:', errorData);
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan atau server saat menambahkan mobil.');
      console.error('Network error adding car:', err);
    }
  };

  const handleEditClick = (car) => {
    setEditingCar(car);
    setEditBrand(car.brand);
    setEditModel(car.model);
    setEditYear(car.year);
    setEditLicensePlate(car.licensePlate);
    setEditDailyRate(car.dailyRate);
    setEditAvailable(car.available);
    setError(null); // Clear any previous error messages
    setSuccess(null); // Clear any previous success messages
  };

  const handleUpdateCar = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!editBrand || !editModel || !editYear || !editLicensePlate || !editDailyRate) {
        setError('Semua kolom harus diisi untuk update.');
        return;
    }
    if (isNaN(editDailyRate) || parseFloat(editDailyRate) <= 0) {
        setError('Harga Harian harus angka positif untuk update.');
        return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/cars/${editingCar.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          brand: editBrand,
          model: editModel,
          year: editYear,
          licensePlate: editLicensePlate,
          dailyRate: parseFloat(editDailyRate),
          available: editAvailable,
        }),
      });

      if (response.ok) {
        setSuccess('Mobil berhasil diperbarui!');
        setEditingCar(null); // Keluar dari mode edit
        fetchCars(); // Refresh daftar mobil
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Gagal memperbarui mobil.');
        console.error('Failed to update car:', errorData);
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan atau server saat memperbarui mobil.');
      console.error('Network error updating car:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditingCar(null);
    setError(null);
    setSuccess(null);
  };

  const handleDeleteCar = async (carId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus mobil ini? Semua rental terkait akan ikut terhapus.')) {
      setError(null);
      setSuccess(null);
      try {
        const response = await fetch(`http://localhost:8080/api/cars/${carId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok || response.status === 204) { // Status 200 OK atau 204 No Content
          setSuccess('Mobil berhasil dihapus!');
          fetchCars(); // Refresh daftar mobil
        } else {
          // Coba parse JSON jika ada body, jika tidak, gunakan statusText
          const errorData = await response.json().catch(() => ({})); // Menangkap error jika tidak ada JSON body
          setError(errorData.message || `Gagal menghapus mobil: ${response.status} ${response.statusText}`);
          console.error('Failed to delete car:', response.status, errorData);
        }
      } catch (err) {
        setError('Terjadi kesalahan jaringan atau server saat menghapus mobil.');
        console.error('Network error deleting car:', err);
      }
    }
  };

  // --- User Management Handlers ---
  const handleUpdateUserRole = async (userId, currentRole) => {
    setError(null);
    setSuccess(null);
    const newRole = currentRole === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
    if (!window.confirm(`Apakah Anda yakin ingin mengubah peran pengguna ini menjadi ${newRole}?`)) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:8080/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'text/plain', // Penting: Kirim sebagai text/plain karena body hanya string
          'Authorization': `Bearer ${token}`
        },
        body: newRole, // Kirim string role langsung
      });

      if (response.ok) {
        setSuccess(`Peran pengguna berhasil diubah menjadi ${newRole}!`);
        fetchUsers(); // Refresh daftar pengguna
      } else {
        const errorData = await response.json().catch(() => ({})); // Menangkap error jika tidak ada JSON body
        setError(errorData.message || `Gagal mengubah peran pengguna: ${response.status} ${response.statusText}`);
        console.error('Failed to update user role:', errorData);
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan atau server saat mengubah peran pengguna.');
      console.error('Network error updating user role:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini? Semua data terkait (misal: rental) akan dihapus.')) {
      setError(null);
      setSuccess(null);
      try {
        const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok || response.status === 204) { // Status 200 OK atau 204 No Content
          setSuccess('Pengguna berhasil dihapus!');
          fetchUsers(); // Refresh daftar pengguna
          // Jika admin menghapus dirinya sendiri, perlu logout
          if (userId === loggedInUsername) { // Ini tidak benar, harusnya user ID, bukan username
            // logout(); // Panggil fungsi logout jika admin menghapus dirinya sendiri
            // navigate('/login');
          }
        } else {
          const errorData = await response.json().catch(() => ({})); // Menangkap error jika tidak ada JSON body
          setError(errorData.message || `Gagal menghapus pengguna: ${response.status} ${response.statusText}`);
          console.error('Failed to delete user:', response.status, errorData);
        }
      } catch (err) {
        setError('Terjadi kesalahan jaringan atau server saat menghapus pengguna.');
        console.error('Network error deleting user:', err);
      }
    }
  };


  // --- Conditional Rendering for Access Control ---
  if (!isLoggedIn) {
    return <div className="text-center p-8 text-red-500">Anda harus login untuk mengakses dashboard.</div>;
  }

  if (!isAdmin) {
    return <div className="text-center p-8 text-red-500">Anda tidak memiliki izin untuk mengakses halaman ini. (Hanya Admin)</div>;
  }

  // --- Main Render ---
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Dashboard Admin</h1>

      {/* Global Error/Success Messages */}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{success}</div>}

      {/* Form Tambah Mobil */}
      {!editingCar && (
        <div className="bg-white p-8 rounded-lg shadow-lg mb-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-center">Tambah Mobil Baru</h2>
          <form onSubmit={handleAddCar} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Merek</label>
              <input type="text" id="brand" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" value={brand} onChange={(e) => setBrand(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
              <input type="text" id="model" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm p-2" value={model} onChange={(e) => setModel(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700">Tahun</label>
              <input type="text" id="year" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={year} onChange={(e) => setYear(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700">Plat Nomor</label>
              <input type="text" id="licensePlate" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} required />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="dailyRate" className="block text-sm font-medium text-gray-700">Harga Harian (Rp)</label>
              <input type="number" id="dailyRate" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={dailyRate} onChange={(e) => setDailyRate(e.target.value)} required min="0" step="any" />
            </div>
            <div className="md:col-span-2 flex items-center">
              <input type="checkbox" id="available" className="h-4 w-4 text-indigo-600 border-gray-300 rounded" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
              <label htmlFor="available" className="ml-2 block text-sm font-medium text-gray-700">Tersedia untuk disewa</label>
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300">
                Tambah Mobil
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Form Edit Mobil */}
      {editingCar && (
        <div className="bg-white p-8 rounded-lg shadow-lg mb-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-center">Edit Mobil: {editingCar.brand} {editingCar.model}</h2>
          <form onSubmit={handleUpdateCar} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="editBrand" className="block text-sm font-medium text-gray-700">Merek</label>
              <input type="text" id="editBrand" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={editBrand} onChange={(e) => setEditBrand(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="editModel" className="block text-sm font-medium text-gray-700">Model</label>
              <input type="text" id="editModel" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={editModel} onChange={(e) => setEditModel(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="editYear" className="block text-sm font-medium text-gray-700">Tahun</label>
              <input type="text" id="editYear" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={editYear} onChange={(e) => setEditYear(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="editLicensePlate" className="block text-sm font-medium text-gray-700">Plat Nomor</label>
              <input type="text" id="editLicensePlate" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={editLicensePlate} onChange={(e) => setEditLicensePlate(e.target.value)} required />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="editDailyRate" className="block text-sm font-medium text-gray-700">Harga Harian (Rp)</label>
              <input type="number" id="editDailyRate" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={editDailyRate} onChange={(e) => setEditDailyRate(e.target.value)} required min="0" step="any" />
            </div>
            <div className="md:col-span-2 flex items-center">
              <input type="checkbox" id="editAvailable" className="h-4 w-4 text-indigo-600 border-gray-300 rounded" checked={editAvailable} onChange={(e) => setEditAvailable(e.target.checked)} />
              <label htmlFor="editAvailable" className="ml-2 block text-sm font-medium text-gray-700">Tersedia untuk disewa</label>
            </div>
            <div className="md:col-span-2 flex justify-end space-x-2">
              <button type="button" onClick={handleCancelEdit} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-300">
                Batal
              </button>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300">
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Daftar Mobil (Admin View) */}
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center">Daftar Mobil (Admin View)</h2>
        {loadingCars ? ( // Menggunakan loadingCars
          <p className="text-center">Memuat daftar mobil...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : cars.length === 0 ? (
          <p className="text-center">Belum ada mobil yang ditambahkan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merek</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tahun</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plat Nomor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Harian</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cars.map((car) => (
                  <tr key={car.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{car.brand}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{car.model}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{car.year}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{car.licensePlate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp{car.dailyRate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${car.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {car.available ? 'Tersedia' : 'Tidak Tersedia'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(car)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCar(car.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bagian Manajemen Pengguna */}
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto mt-8">
        <h2 className="text-2xl font-semibold mb-6 text-center">Manajemen Pengguna</h2>
        {loadingUsers ? ( // Menggunakan loadingUsers
          <p className="text-center">Memuat daftar pengguna...</p>
        ) : error ? ( // Menggunakan error state umum
          <p className="text-center text-red-500">{error}</p>
        ) : users.length === 0 ? (
          <p className="text-center">Belum ada pengguna terdaftar.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {/* Pastikan admin tidak bisa mengubah role-nya sendiri */}
                      {user.username !== loggedInUsername && ( // Menggunakan loggedInUsername dari AuthContext
                        <button
                          onClick={() => handleUpdateUserRole(user.id, user.role)}
                          className={`px-3 py-1 rounded-md text-white mr-2 ${user.role === 'ADMIN' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-purple-500 hover:bg-purple-600'}`}
                        >
                          Ubah ke {user.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN'}
                        </button>
                      )}
                      {/* Pastikan admin tidak bisa menghapus dirinya sendiri */}
                      {user.username !== loggedInUsername && ( // Menggunakan loggedInUsername dari AuthContext
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Hapus
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;