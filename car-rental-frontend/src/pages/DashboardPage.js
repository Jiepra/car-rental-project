// src/pages/DashboardPage.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';


const DashboardPage = () => {
  const { isLoggedIn, isAdmin, token, username: loggedInUsername } = useContext(AuthContext);

  const [editingCar, setEditingCar] = useState(null);

  const [cars, setCars] = useState([]);
  const [loadingCars, setLoadingCars] = useState(true);
  // --- STATE PAGINASI UNTUK MOBIL ---
  const [currentCarPage, setCurrentCarPage] = useState(0);
  const [totalCarPages, setTotalCarPages] = useState(0);
  const [totalCarElements, setTotalCarElements] = useState(0);
  const [carPageSize, setCarPageSize] = useState(10); // Default size sesuai backend

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  // --- STATE PAGINASI UNTUK PENGGUNA ---
  const [currentUserPage, setCurrentUserPage] = useState(0);
  const [totalUserPages, setTotalUserPages] = useState(0);
  const [totalUserElements, setTotalUserElements] = useState(0);
  const [userPageSize, setUserPageSize] = useState(10);

  const [rentals, setRentals] = useState([]);
  const [loadingRentals, setLoadingRentals] = useState(true);
  // --- STATE PAGINASI UNTUK RENTAL ---
  const [currentRentalPage, setCurrentRentalPage] = useState(0);
  const [totalRentalPages, setTotalRentalPages] = useState(0);
  const [totalRentalElements, setTotalRentalElements] = useState(0);
  const [rentalPageSize, setRentalPageSize] = useState(10);


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
      .typeError('Harga Harian harus angka')
      .positive('Harga Harian harus positif')
      .required('Harga Harian wajib diisi'),
    available: Yup.boolean().required('Status ketersediaan wajib diisi'),
    imageFile: Yup.mixed() // Opsional: Tambahkan validasi file jika diperlukan (misal .test ukuran/tipe)
       .nullable()
       .test(
        'fileSize', 
        'Ukuran gambar terlalu besar (max 2MB)', 
        (value) => !value || (value instanceof File && value.size <= 2 * 1024 * 1024)
      )
        .test(
          'fileType', 
          'Jenis gambar tidak valid (JPEG, PNG, GIF)', 
          (value) => !value || (value instanceof File && ['image/jpeg', 'image/png', 'image/gif'].includes(value.type))
        ),
  });

  // --- Formik Hook for Add Car Form ---
  const addCarFormik = useFormik({
    initialValues: {
      brand: '', model: '', year: '', licensePlate: '', dailyRate: '', available: true,
      imageFile: null,
      imageUrlPreview: ''
    },
    validationSchema: carValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      const formData = new FormData();
      formData.append('car', new Blob([JSON.stringify({
        brand: values.brand,
        model: values.model,
        year: values.year,
        licensePlate: values.licensePlate,
        dailyRate: parseFloat(values.dailyRate),
        available: values.available,
      })], { type: 'application/json' }));

      if (values.imageFile) {
        formData.append('image', values.imageFile);
      }

      try {
        const response = await fetch('http://localhost:8080/api/cars', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }, // <--- HAPUS 'Content-Type' DI SINI!
          body: formData,
        });

        if (response.ok) {
          toast.success('Mobil berhasil ditambahkan!');
          resetForm();
          fetchCars();
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
      id: '', brand: '', model: '', year: '', licensePlate: '', dailyRate: '', available: true,
      imageFile: null,
      imageUrl: '',
      imageUrlPreview: '',
    },
    validationSchema: carValidationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append('car', new Blob([JSON.stringify({
        id: values.id,
        brand: values.brand,
        model: values.model,
        year: values.year,
        licensePlate: values.licensePlate,
        dailyRate: parseFloat(values.dailyRate),
        available: values.available,
        imageUrl: values.imageFile ? '' : values.imageUrl
      })], { type: 'application/json' }));

      if (values.imageFile) {
        formData.append('image', values.imageFile);
      }

      try {
        const response = await fetch(`http://localhost:8080/api/cars/${values.id}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }, // <--- HAPUS 'Content-Type' DI SINI!
          body: formData,
        });

        if (response.ok) {
          toast.success('Mobil berhasil diperbarui!');
          setEditingCar(null);
          fetchCars();
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
      const newValues = {
        id: editingCar.id,
        brand: editingCar.brand,
        model: editingCar.model,
        year: editingCar.year,
        licensePlate: editingCar.licensePlate,
        dailyRate: String(editingCar.dailyRate),
        available: editingCar.available,
        imageFile: null, // Pastikan file input direset
        imageUrl: editingCar.imageUrl || '', // Set URL gambar yang sudah ada dari DB
        imageUrlPreview: editingCar.imageUrl ? `http://localhost:8080${editingCar.imageUrl}` : '' // Tampilkan preview gambar lama
      };
      editCarFormik.setValues(newValues);
    } else {
      editCarFormik.resetForm();
    }
  }, [editingCar]);

  // --- Fetching Data Functions (Wrapped in useCallback) ---
  const fetchCars = useCallback(async () => {
    setLoadingCars(true);
    try {
      const response = await fetch(`http://localhost:8080/api/cars?page=${currentCarPage}&size=${carPageSize}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorText = await response.text();
        const errorMessage = `Failed to fetch cars: ${response.status} ${response.statusText}. Detail: ${errorText.substring(0, 100)}...`;
        throw new Error(errorMessage);
      }
      const pageData = await response.json();
      setCars(pageData.content || []); // *** PASTIKAN SELALU ARRAY ***
      setTotalCarPages(pageData.totalPages || 0);
      setTotalCarElements(pageData.totalElements || 0);
      setCurrentCarPage(pageData.number || 0);
    } catch (err) {
      toast.error(err.message || 'Gagal memuat daftar mobil.');
      console.error("Error fetching cars for dashboard:", err);
      setCars([]); // *** PASTIKAN SET KE ARRAY KOSONG SAAT ERROR ***
      setTotalCarPages(0);
      setTotalCarElements(0);
      setCurrentCarPage(0);
    } finally {
      setLoadingCars(false);
    }
  }, [token, setCars, setLoadingCars, currentCarPage, carPageSize]);


  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch(`http://localhost:8080/api/users?page=${currentUserPage}&size=${userPageSize}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorText = await response.text();
        const errorMessage = `Failed to fetch users: ${response.status} ${response.statusText}. Detail: ${errorText.substring(0, 100)}...`;
        throw new Error(errorMessage);
      }
      const pageData = await response.json();
      setUsers(pageData.content || []); // *** PASTIKAN SELALU ARRAY ***
      setTotalUserPages(pageData.totalPages || 0);
      setTotalUserElements(pageData.totalElements || 0);
      setCurrentUserPage(pageData.number || 0);
    } catch (err) {
      toast.error(err.message || 'Gagal memuat daftar pengguna.');
      console.error("Error fetching users for dashboard:", err);
      setUsers([]); // *** PASTIKAN SET KE ARRAY KOSONG SAAT ERROR ***
      setTotalUserPages(0);
      setTotalUserElements(0);
      setCurrentUserPage(0);
    } finally {
      setLoadingUsers(false);
    }
  }, [token, setUsers, setLoadingUsers, currentUserPage, userPageSize]);

  const fetchRentals = useCallback(async () => {
    setLoadingRentals(true);
    try {
      const response = await fetch(`http://localhost:8080/api/rentals?page=${currentRentalPage}&size=${rentalPageSize}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorText = await response.text();
        const errorMessage = `Failed to fetch rentals: ${response.status} ${response.statusText}. Detail: ${errorText.substring(0, 100)}...`;
        throw new Error(errorMessage);
      }
      const pageData = await response.json();
      setRentals(pageData.content || []); // *** PASTIKAN SELALU ARRAY ***
      setTotalRentalPages(pageData.totalPages || 0);
      setTotalRentalElements(pageData.totalElements || 0);
      setCurrentRentalPage(pageData.number || 0);
    } catch (err) {
      toast.error(err.message || 'Gagal memuat daftar rental.');
      console.error("Error fetching rentals for dashboard:", err);
      setRentals([]); // *** PASTIKAN SET KE ARRAY KOSONG SAAT ERROR ***
      setTotalRentalPages(0);
      setTotalRentalElements(0);
      setCurrentRentalPage(0);
    } finally {
      setLoadingRentals(false);
    }
  }, [token, setRentals, setLoadingRentals, currentRentalPage, rentalPageSize]);

  // --- useEffect for Initial Data Load ---
  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      fetchCars();
      fetchUsers();
      fetchRentals();
    }
  }, [isLoggedIn, isAdmin, token, fetchCars, fetchUsers, fetchRentals]);

  // --- Paginasi Handlers ---
  const handleCarPageChange = (pageNumber) => setCurrentCarPage(pageNumber);
  const handleUserPageChange = (pageNumber) => setCurrentUserPage(pageNumber);
  const handleRentalPageChange = (pageNumber) => setCurrentRentalPage(pageNumber);

  // --- Car Management Handlers ---
  const handleEditClick = (car) => {
    setEditingCar(car);
  };

  const handleCancelEdit = () => {
    setEditingCar(null);
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
  const handleUpdateRentalStatus = async (rentalId, newStatus) => {
    if (window.confirm(`Apakah Anda yakin ingin mengubah status rental ini menjadi ${newStatus}?`)) {
      try {
        const response = await fetch(`http://localhost:8080/api/rentals/${rentalId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'text/plain', // Ini sudah benar untuk mengirim string
            'Authorization': `Bearer ${token}`
          },
          body: newStatus, // Mengirim string 'CONFIRMED' atau 'CANCELLED' secara langsung
        });

        if (response.ok) {
          toast.success(`Status rental berhasil diubah menjadi ${newStatus}!`);
          fetchRentals();
          fetchCars();
        } else {
          // Penting: Tangani response.text() jika bukan JSON (karena 400 bisa HTML)
          const errorText = await response.text(); // Ambil respons sebagai teks
          let errorMessage = `Gagal mengubah status rental: ${response.status} ${response.statusText}`;
          try {
            const errorData = JSON.parse(errorText); // Coba parse sebagai JSON
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // Jika bukan JSON, gunakan teks mentah dari server
            errorMessage = `Gagal mengubah status rental: ${response.status} ${response.statusText}. Detail: ${errorText.substring(0, 100)}...`;
          }
          toast.error(errorMessage);
          console.error('Failed to update rental status:', response.status, errorText);
        }
      } catch (err) {
        toast.error('Terjadi kesalahan jaringan atau server saat mengubah status rental.');
        console.error('Network error updating rental status:', err);
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
            {/* *** INPUT FILE UNTUK GAMBAR (ADD FORM) *** */}
                <div className="md:col-span-2">
                  <label htmlFor="imageFileAdd" className="block text-sm font-medium text-gray-700">Gambar Mobil (Opsional)</label>
                  <input
                    type="file"
                    id="imageFileAdd"
                    name="imageFile"
                    accept="image/*"
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(event) => {
                      addCarFormik.setFieldValue("imageFile", event.currentTarget.files[0]);
                      // Membuat URL objek untuk preview, penting untuk membersihkan URL
                      if (event.currentTarget.files[0]) {
                        addCarFormik.setFieldValue("imageUrlPreview", URL.createObjectURL(event.currentTarget.files[0]));
                      } else {
                        addCarFormik.setFieldValue("imageUrlPreview", "");
                      }
                    }}
                    onBlur={addCarFormik.handleBlur}
                  />
                  {/* Tampilkan pesan error validasi file */}
                  {addCarFormik.touched.imageFile && addCarFormik.errors.imageFile ? (
                    <div className="text-red-500 text-sm mt-1">{addCarFormik.errors.imageFile}</div>
                  ) : null}
                  {addCarFormik.values.imageUrlPreview && (
                    <img src={addCarFormik.values.imageUrlPreview} alt="Preview" className="mt-2 h-20 w-auto object-cover rounded-md" />
                  )}
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
            {/* *** INPUT FILE UNTUK GAMBAR (EDIT FORM) *** */}
            <div className="md:col-span-2">
              <label htmlFor="imageFileEdit" className="block text-sm font-medium text-gray-700">Gambar Mobil (Kosongkan untuk hapus/ganti)</label>
              <input
                type="file"
                id="imageFileEdit"
                name="imageFile" // Name untuk Formik
                accept="image/*"
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={(event) => {
                  editCarFormik.setFieldValue("imageFile", event.currentTarget.files[0]);
                  // Preview gambar yang baru dipilih, atau gambar lama jika tidak ada yang baru
                  editCarFormik.setFieldValue("imageUrlPreview", event.currentTarget.files[0] ? URL.createObjectURL(event.currentTarget.files[0]) : (editingCar.imageUrl || ''));
                }}
                onBlur={editCarFormik.handleBlur}
              />
              {editCarFormik.values.imageUrlPreview && ( // Preview gambar jika ada
                <img src={editCarFormik.values.imageUrlPreview} alt="Current" className="mt-2 h-20 w-auto object-cover rounded-md" />
              )}
              {/* Tambahkan tombol untuk menghapus gambar yang sudah ada (opsional) */}
              {editCarFormik.values.imageUrl && !editCarFormik.values.imageFile && (
                <button
                  type="button"
                  onClick={() => {
                    editCarFormik.setFieldValue("imageUrl", ""); // Kosongkan URL gambar di Formik values
                    editCarFormik.setFieldValue("imageFile", null); // Pastikan tidak ada file yang dipilih
                    editCarFormik.setFieldValue("imageUrlPreview", ""); // Kosongkan preview
                  }}
                  className="mt-2 px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                >
                  Hapus Gambar Ini
                </button>
              )}
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
        ) : cars.length === 0 && totalCarElements === 0 ? (
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gambar</th>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {car.imageUrl ? (
                        <img src={`http://localhost:8080${car.imageUrl}`} alt="Mobil" className="h-10 w-10 object-cover rounded-full" />
                      ) : (
                        <span>Tidak ada gambar</span>
                      )}
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

      {/* *** KONTROL PAGINASI MOBIL DI DASHBOARD *** */}
      {totalCarPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => handleCarPageChange(currentCarPage - 1)}
                disabled={currentCarPage === 0}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: totalCarPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handleCarPageChange(i)}
                  className={`px-4 py-2 rounded-md ${currentCarPage === i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handleCarPageChange(currentCarPage + 1)}
                disabled={currentCarPage === totalCarPages - 1}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
              >
                Next
              </button>
              <p className="ml-4 text-gray-700">Total Mobil: {totalCarElements}</p>
            </div>
        )}

      {/* Bagian Manajemen Pengguna */}
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto mt-8">
        <h2 className="text-2xl font-semibold mb-6 text-center">Manajemen Pengguna</h2>
        {loadingUsers ? (
          <p className="text-center">Memuat daftar pengguna...</p>
        ) : users.length === 0 && totalUserElements === 0 ? (
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
                      {user.username !== loggedInUsername && (
                        <button
                          onClick={() => handleUpdateUserRole(user.id, user.role)}
                          className={`px-3 py-1 rounded-md text-white mr-2 ${user.role === 'ADMIN' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-purple-500 hover:bg-purple-600'}`}
                        >
                          Ubah ke {user.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN'}
                        </button>
                      )}
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
      
      {/* *** KONTROL PAGINASI PENGGUNA DI DASHBOARD *** */}
        {totalUserPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => handleUserPageChange(currentUserPage - 1)}
                disabled={currentUserPage === 0}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: totalUserPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handleUserPageChange(i)}
                  className={`px-4 py-2 rounded-md ${currentUserPage === i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handleUserPageChange(currentUserPage + 1)}
                disabled={currentUserPage === totalUserPages - 1}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
              >
                Next
              </button>
              <p className="ml-4 text-gray-700">Total Pengguna: {totalUserElements}</p>
            </div>
          )}

      {/* Bagian Manajemen Rental */}
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto mt-8">
        <h2 className="text-2xl font-semibold mb-6 text-center">Manajemen Rental</h2>
        {loadingRentals ? (
          <p className="text-center">Memuat daftar rental...</p>
        ) : rentals.length === 0 && totalRentalElements === 0 ? (
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
                        rental.status === 'PICKED_UP' ? 'bg-blue-100 text-blue-800' : // Warna baru
                        rental.status === 'OVERDUE' ? 'bg-red-300 text-red-900' : // Warna baru
                        rental.status === 'CANCELLED' ? 'bg-gray-400 text-gray-900' : // Warna baru
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {rental.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {rental.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateRentalStatus(rental.id, 'CONFIRMED')}
                          className="px-3 py-1 rounded-md text-white bg-green-600 hover:bg-green-700 transition duration-300 mr-2"
                        >
                          Konfirmasi
                        </button>
                      )}
                      {(rental.status === 'PICKED_UP' || rental.status === 'OVERDUE') && (
                        <button
                          onClick={() => handleUpdateRentalStatus(rental.id, 'RETURNED')} // Tombol baru
                          className="px-3 py-1 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition duration-300 mr-2"
                        >
                          Kembalikan Mobil
                        </button>
                      )}
                      {(rental.status === 'PENDING' || rental.status === 'CONFIRMED') && (
                        <button
                          onClick={() => handleUpdateRentalStatus(rental.id, 'CANCELLED')} // Tombol baru
                          className="px-3 py-1 rounded-md text-white bg-red-600 hover:bg-red-700 transition duration-300"
                        >
                          Batalkan
                        </button>
                      )}
                      {/* Tambahkan tombol untuk COMPLETED atau OVERDUE (jika ingin admin set manual) */}
                      {rental.status === 'RETURNED' && (
                        <button
                          onClick={() => handleUpdateRentalStatus(rental.id, 'COMPLETED')}
                          className="px-3 py-1 rounded-md text-white bg-green-800 hover:bg-green-900 transition duration-300 mr-2"
                        >
                          Set Completed
                        </button>
                      )}
                      {rental.status === 'PICKED_UP' && (
                        <button
                          onClick={() => handleUpdateRentalStatus(rental.id, 'OVERDUE')}
                          className="px-3 py-1 rounded-md text-white bg-red-800 hover:bg-red-900 transition duration-300"
                        >
                          Set Overdue
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* *** KONTROL PAGINASI RENTAL DI DASHBOARD *** */}
        {totalRentalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => handleRentalPageChange(currentRentalPage - 1)}
                disabled={currentRentalPage === 0}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: totalRentalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handleRentalPageChange(i)}
                  className={`px-4 py-2 rounded-md ${currentRentalPage === i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handleRentalPageChange(currentRentalPage + 1)}
                disabled={currentRentalPage === totalRentalPages - 1}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50"
              >
                Next
              </button>
              <p className="ml-4 text-gray-700">Total Rental: {totalRentalElements}</p>
            </div>
          )}

      </div>

    </div>
  );
};

export default DashboardPage;