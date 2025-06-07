// src/pages/DashboardPage.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useFormik } from 'formik'; // Import useFormik
import * as Yup from 'yup'; // Import Yup

const DashboardPage = () => {
  const { isLoggedIn, isAdmin, token, username: loggedInUsername } = useContext(AuthContext);

  // State untuk mengelola apakah form edit sedang aktif
  const [editingCar, setEditingCar] = useState(null);

  // State untuk daftar mobil, user, dan rental
  const [cars, setCars] = useState([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [rentals, setRentals] = useState([]);
  const [loadingRentals, setLoadingRentals] = useState(true);

  // --- Validation Schema for Cars (Add and Edit) ---
  const carValidationSchema = Yup.object({
    brand: Yup.string().required('Merek wajib diisi'),
    model: Yup.string().required('Model wajib diisi'),
    year: Yup.string()
      .matches(/^[0-9]{4}$/, 'Tahun harus 4 digit angka')
      .required('Tahun wajib diisi'),
    licensePlate: Yup.string()
      .min(5, 'Plat Nomor minimal 5 karakter')
      .max(10, 'Plat Nomor maksimal 10 karakter')
      .required('Plat Nomor wajib diisi'),
    dailyRate: Yup.number()
      .typeError('Harga Harian harus angka') // Tambahkan typeError untuk angka
      .positive('Harga Harian harus positif')
      .required('Harga Harian wajib diisi'),
    available: Yup.boolean().required('Status ketersediaan wajib diisi'),
  });

  // --- Formik Hook for Add Car Form ---
  const addCarFormik = useFormik({
    initialValues: {
      brand: '',
      model: '',
      year: '',
      licensePlate: '',
      dailyRate: '', // Tetap string di initialValues untuk input type="number"
      available: true,
    },
    validationSchema: carValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await fetch('http://localhost:8080/api/cars', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            brand: values.brand,
            model: values.model,
            year: values.year,
            licensePlate: values.licensePlate,
            dailyRate: parseFloat(values.dailyRate),
            available: values.available,
          }),
        });

        if (response.ok) {
          toast.success('Mobil berhasil ditambahkan!');
          resetForm(); // Reset form setelah berhasil
          fetchCars(); // Refresh daftar mobil
        } else {
          const errorData = await response.json().catch(() => ({}));
          toast.error(errorData.message || 'Gagal menambahkan mobil.');
          console.error('Failed to add car:', errorData);
        }
      } catch (err) {
        toast.error('Terjadi kesalahan jaringan atau server saat menambahkan mobil.');
        console.error('Network error adding car:', err);
      }
    },
  });

  // --- Formik Hook for Edit Car Form ---
  const editCarFormik = useFormik({
    initialValues: {
      id: '', // Diisi dari editingCar saat edit mode
      brand: '',
      model: '',
      year: '',
      licensePlate: '',
      dailyRate: '',
      available: true,
    },
    validationSchema: carValidationSchema,
    onSubmit: async (values) => {
      try {
        const response = await fetch(`http://localhost:8080/api/cars/${values.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            brand: values.brand,
            model: values.model,
            year: values.year,
            licensePlate: values.licensePlate,
            dailyRate: parseFloat(values.dailyRate),
            available: values.available,
          }),
        });

        if (response.ok) {
          toast.success('Mobil berhasil diperbarui!');
          setEditingCar(null); // Keluar dari mode edit
          fetchCars(); // Refresh daftar mobil
        } else {
          const errorData = await response.json().catch(() => ({}));
          toast.error(errorData.message || 'Gagal memperbarui mobil.');
          console.error('Failed to update car:', errorData);
        }
      } catch (err) {
        toast.error('Terjadi kesalahan jaringan atau server saat memperbarui mobil.');
        console.error('Network error updating car:', err);
      }
    },
  });

  // --- Effect untuk mengisi form edit saat editingCar berubah ---
  useEffect(() => {
    if (editingCar) {
      editCarFormik.setValues({
        id: editingCar.id,
        brand: editingCar.brand,
        model: editingCar.model,
        year: editingCar.year,
        licensePlate: editingCar.licensePlate,
        dailyRate: String(editingCar.dailyRate),
        available: editingCar.available,
      });
    } else {
      editCarFormik.resetForm();
    }
  }, [editingCar]);


  // --- Fetching Data Functions (Wrapped in useCallback) ---
  const fetchCars = useCallback(async () => {
    setLoadingCars(true);
    try {
      const response = await fetch('http://localhost:8080/api/cars', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`Failed to fetch cars: ${response.statusText}`);
      setCars(await response.json());
    } catch (err) {
      toast.error(err.message || 'Gagal memuat daftar mobil.');
      console.error("Error fetching cars for dashboard:", err);
    } finally {
      setLoadingCars(false);
    }
  }, [token, setCars, setLoadingCars]);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('http://localhost:8080/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`Failed to fetch users: ${response.statusText}`);
      setUsers(await response.json());
    } catch (err) {
      toast.error(err.message || 'Gagal memuat daftar pengguna.');
      console.error("Error fetching users for dashboard:", err);
    } finally {
      setLoadingUsers(false);
    }
  }, [token, setUsers, setLoadingUsers]);

  const fetchRentals = useCallback(async () => {
    setLoadingRentals(true);
    try {
      const response = await fetch('http://localhost:8080/api/rentals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`Failed to fetch rentals: ${response.statusText}`);
      setRentals(await response.json());
    } catch (err) {
      toast.error(err.message || 'Gagal memuat daftar rental.');
      console.error("Error fetching rentals for dashboard:", err);
    } finally {
      setLoadingRentals(false);
    }
  }, [token, setRentals, setLoadingRentals]);

  // --- useEffect for Initial Data Load ---
  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      fetchCars();
      fetchUsers();
      fetchRentals();
    }
  }, [isLoggedIn, isAdmin, token, fetchCars, fetchUsers, fetchRentals]);


  // --- Car Management Handlers (Sekarang menggunakan Formik.handleSubmit di JSX) ---
  const handleEditClick = (car) => {
    setEditingCar(car); // Ini akan memicu useEffect untuk mengisi editCarFormik
  };

  const handleCancelEdit = () => {
    setEditingCar(null);
    // editCarFormik.resetForm() akan dipanggil di useEffect ketika editingCar menjadi null
  };

  const handleDeleteCar = async (carId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus mobil ini? Semua rental terkait akan ikut terhapus.')) {
      try {
        const response = await fetch(`http://localhost:8080/api/cars/${carId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok || response.status === 204) {
          toast.success('Mobil berhasil dihapus!');
          fetchCars();
        } else {
          const errorData = await response.json().catch(() => ({}));
          toast.error(errorData.message || `Gagal menghapus mobil: ${response.status} ${response.statusText}`);
          console.error('Failed to delete car:', response.status, errorData);
        }
      } catch (err) {
        toast.error('Terjadi kesalahan jaringan atau server saat menghapus mobil.');
        console.error('Network error deleting car:', err);
      }
    }
  };

  // --- User Management Handlers ---
  const handleUpdateUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
    if (!window.confirm(`Apakah Anda yakin ingin mengubah peran pengguna ini menjadi ${newRole}?`)) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:8080/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'text/plain',
          'Authorization': `Bearer ${token}`
        },
        body: newRole,
      });

      if (response.ok) {
        toast.success(`Peran pengguna berhasil diubah menjadi ${newRole}!`);
        fetchUsers();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || `Gagal mengubah peran pengguna: ${response.status} ${response.statusText}`);
        console.error('Failed to update user role:', errorData);
      }
    } catch (err) {
      toast.error('Terjadi kesalahan jaringan atau server saat mengubah peran pengguna.');
      console.error('Network error updating user role:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini? Semua data terkait (misal: rental) akan dihapus.')) {
      try {
        const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok || response.status === 204) {
          toast.success('Pengguna berhasil dihapus!');
          fetchUsers();
          // Logic for admin deleting self can be added here
        } else {
          const errorData = await response.json().catch(() => ({}));
          toast.error(errorData.message || `Gagal menghapus pengguna: ${response.status} ${response.statusText}`);
          console.error('Failed to delete user:', response.status, errorData);
        }
      } catch (err) {
        toast.error('Terjadi kesalahan jaringan atau server saat menghapus pengguna.');
        console.error('Network error deleting user:', err);
      }
    }
  };

  // --- Confirmation Handler ---
  const handleConfirmRental = async (rentalId) => {
    if (window.confirm('Apakah Anda yakin ingin mengkonfirmasi pembayaran rental ini?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/rentals/${rentalId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'text/plain',
            'Authorization': `Bearer ${token}`
          },
          body: 'CONFIRMED',
        });

        if (response.ok) {
          toast.success('Rental berhasil dikonfirmasi!');
          fetchRentals();
          fetchCars();
        } else {
          const errorData = await response.json().catch(() => ({}));
          toast.error(errorData.message || `Gagal mengkonfirmasi rental: ${response.status} ${response.statusText}`);
          console.error('Failed to confirm rental:', errorData);
        }
      } catch (err) {
        toast.error('Terjadi kesalahan jaringan atau server saat mengkonfirmasi rental.');
        console.error('Network error confirming rental:', err);
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

      {/* Form Tambah Mobil */}
      {!editingCar && (
        <div className="bg-white p-8 rounded-lg shadow-lg mb-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-center">Tambah Mobil Baru</h2>
          <form onSubmit={addCarFormik.handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Merek</label>
              <input
                type="text"
                id="brand"
                name="brand"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                onChange={addCarFormik.handleChange}
                onBlur={addCarFormik.handleBlur}
                value={addCarFormik.values.brand}
              />
              {addCarFormik.touched.brand && addCarFormik.errors.brand ? (
                <div className="text-red-500 text-sm mt-1">{addCarFormik.errors.brand}</div>
              ) : null}
            </div>
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
              <input
                type="text"
                id="model"
                name="model"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm p-2"
                onChange={addCarFormik.handleChange}
                onBlur={addCarFormik.handleBlur}
                value={addCarFormik.values.model}
              />
              {addCarFormik.touched.model && addCarFormik.errors.model ? (
                <div className="text-red-500 text-sm mt-1">{addCarFormik.errors.model}</div>
              ) : null}
            </div>
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700">Tahun</label>
              <input
                type="text"
                id="year"
                name="year"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                onChange={addCarFormik.handleChange}
                onBlur={addCarFormik.handleBlur}
                value={addCarFormik.values.year}
              />
              {addCarFormik.touched.year && addCarFormik.errors.year ? (
                <div className="text-red-500 text-sm mt-1">{addCarFormik.errors.year}</div>
              ) : null}
            </div>
            <div>
              <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700">Plat Nomor</label>
              <input
                type="text"
                id="licensePlate"
                name="licensePlate"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                onChange={addCarFormik.handleChange}
                onBlur={addCarFormik.handleBlur}
                value={addCarFormik.values.licensePlate}
              />
              {addCarFormik.touched.licensePlate && addCarFormik.errors.licensePlate ? (
                <div className="text-red-500 text-sm mt-1">{addCarFormik.errors.licensePlate}</div>
              ) : null}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="dailyRate" className="block text-sm font-medium text-gray-700">Harga Harian (Rp)</label>
              <input
                type="number"
                id="dailyRate"
                name="dailyRate"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm p-2"
                onChange={addCarFormik.handleChange}
                onBlur={addCarFormik.handleBlur}
                value={addCarFormik.values.dailyRate}
                min="0" step="any"
              />
              {addCarFormik.touched.dailyRate && addCarFormik.errors.dailyRate ? (
                <div className="text-red-500 text-sm mt-1">{addCarFormik.errors.dailyRate}</div>
              ) : null}
            </div>
            <div className="md:col-span-2 flex items-center">
              <input
                type="checkbox"
                id="available"
                name="available"
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                checked={addCarFormik.values.available}
                onChange={addCarFormik.handleChange}
                onBlur={addCarFormik.handleBlur}
              />
              <label htmlFor="available" className="ml-2 block text-sm font-medium text-gray-700">Tersedia untuk disewa</label>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
                disabled={addCarFormik.isSubmitting}
              >
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
          <form onSubmit={editCarFormik.handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Field ID mobil tersembunyi */}
            <input type="hidden" name="id" value={editCarFormik.values.id} />
            <div>
              <label htmlFor="editBrand" className="block text-sm font-medium text-gray-700">Merek</label>
              <input
                type="text"
                id="editBrand"
                name="brand"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm p-2"
                onChange={editCarFormik.handleChange}
                onBlur={editCarFormik.handleBlur}
                value={editCarFormik.values.brand}
              />
              {editCarFormik.touched.brand && editCarFormik.errors.brand ? (
                <div className="text-red-500 text-sm mt-1">{editCarFormik.errors.brand}</div>
              ) : null}
            </div>
            <div>
              <label htmlFor="editModel" className="block text-sm font-medium text-gray-700">Model</label>
              <input
                type="text"
                id="editModel"
                name="model"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm p-2"
                onChange={editCarFormik.handleChange}
                onBlur={editCarFormik.handleBlur}
                value={editCarFormik.values.model}
              />
              {editCarFormik.touched.model && editCarFormik.errors.model ? (
                <div className="text-red-500 text-sm mt-1">{editCarFormik.errors.model}</div>
              ) : null}
            </div>
            <div>
              <label htmlFor="editYear" className="block text-sm font-medium text-gray-700">Tahun</label>
              <input
                type="text"
                id="editYear"
                name="year"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                onChange={editCarFormik.handleChange}
                onBlur={editCarFormik.handleBlur}
                value={editCarFormik.values.year}
              />
              {editCarFormik.touched.year && editCarFormik.errors.year ? (
                <div className="text-red-500 text-sm mt-1">{editCarFormik.errors.year}</div>
              ) : null}
            </div>
            <div>
              <label htmlFor="editLicensePlate" className="block text-sm font-medium text-gray-700">Plat Nomor</label>
              <input
                type="text"
                id="editLicensePlate"
                name="licensePlate"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                onChange={editCarFormik.handleChange}
                onBlur={editCarFormik.handleBlur}
                value={editCarFormik.values.licensePlate}
              />
              {editCarFormik.touched.licensePlate && editCarFormik.errors.licensePlate ? (
                <div className="text-red-500 text-sm mt-1">{editCarFormik.errors.licensePlate}</div>
              ) : null}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="editDailyRate" className="block text-sm font-medium text-gray-700">Harga Harian (Rp)</label>
              <input
                type="number"
                id="editDailyRate"
                name="dailyRate"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                onChange={editCarFormik.handleChange}
                onBlur={editCarFormik.handleBlur}
                value={editCarFormik.values.dailyRate}
                min="0" step="any"
              />
              {editCarFormik.touched.dailyRate && editCarFormik.errors.dailyRate ? (
                <div className="text-red-500 text-sm mt-1">{editCarFormik.errors.dailyRate}</div>
              ) : null}
            </div>
            <div className="md:col-span-2 flex items-center">
              <input
                type="checkbox"
                id="editAvailable"
                name="available"
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                checked={editCarFormik.values.available}
                onChange={editCarFormik.handleChange}
                onBlur={editCarFormik.handleBlur}
              />
              <label htmlFor="editAvailable" className="ml-2 block text-sm font-medium text-gray-700">Tersedia untuk disewa</label>
            </div>
            <div className="md:col-span-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-300"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300"
                disabled={editCarFormik.isSubmitting}
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Daftar Mobil (Admin View) */}
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center">Daftar Mobil (Admin View)</h2>
        {loadingCars ? (
          <p className="text-center">Memuat daftar mobil...</p>
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
        {loadingUsers ? (
          <p className="text-center">Memuat daftar pengguna...</p>
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
                      {user.username !== loggedInUsername && (
                        <button
                          onClick={() => handleUpdateUserRole(user.id, user.role)}
                          className={`px-3 py-1 rounded-md text-white mr-2 ${user.role === 'ADMIN' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-purple-500 hover:bg-purple-600'}`}
                        >
                          Ubah ke {user.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN'}
                        </button>
                      )}
                      {/* Pastikan admin tidak bisa menghapus dirinya sendiri */}
                      {user.username !== loggedInUsername && (
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

      {/* Bagian Manajemen Rental */}
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto mt-8">
        <h2 className="text-2xl font-semibold mb-6 text-center">Manajemen Rental</h2>
        {loadingRentals ? (
          <p className="text-center">Memuat daftar rental...</p>
        ) : rentals.length === 0 ? (
          <p className="text-center">Belum ada rental.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Rental</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobil</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penyewa</th>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rental.user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rental.startDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rental.endDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp{rental.totalPrice}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        rental.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        rental.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {rental.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {rental.status === 'PENDING' && (
                        <button
                          onClick={() => handleConfirmRental(rental.id)}
                          className="px-3 py-1 rounded-md text-white bg-green-600 hover:bg-green-700 transition duration-300 mr-2"
                        >
                          Konfirmasi
                        </button>
                      )}
                      {/* Tambahkan tombol untuk mengubah status ke COMPLETED atau CANCELLED jika diperlukan */}
                      {/* <button className="text-blue-600 hover:text-blue-900 mr-2">Detail</button> */}
                      {/* <button className="text-red-600 hover:text-red-900">Batalkan</button> */}
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