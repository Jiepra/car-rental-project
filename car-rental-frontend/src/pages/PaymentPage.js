// src/pages/PaymentPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import Link
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useFormik } from 'formik'; // Import useFormik
import * as Yup from 'yup'; // Import Yup

const PaymentPage = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { token, isLoggedIn } = useContext(AuthContext); // Tidak perlu username di sini

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Validation Schema for Payment Form ---
  const paymentValidationSchema = Yup.object({
    startDate: Yup.date()
      .required('Tanggal mulai sewa wajib diisi')
      .nullable()
      .min(new Date(new Date().setHours(0,0,0,0)), 'Tanggal mulai tidak boleh di masa lalu'), // Set to start of current day
    endDate: Yup.date()
      .required('Tanggal selesai sewa wajib diisi')
      .nullable()
      .min(Yup.ref('startDate'), 'Tanggal selesai harus setelah tanggal mulai'),
    // Validasi placeholder untuk kartu kredit
    cardNumber: Yup.string()
      .matches(/^[0-9]{16}$/, 'Nomor kartu harus 16 digit angka')
      .required('Nomor kartu wajib diisi'),
    expiryDate: Yup.string()
      .matches(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, 'Format MM/YY tidak valid')
      .required('Tanggal kedaluwarsa wajib diisi')
      .test('is-future-date', 'Tanggal kedaluwarsa tidak valid', (value) => {
        if (!value) return false;
        const [month, year] = value.split('/').map(Number);
        const currentYear = new Date().getFullYear() % 100; // Get last two digits of current year
        const currentMonth = new Date().getMonth() + 1; // Month is 0-indexed

        if (year < currentYear) return false;
        if (year === currentYear && month < currentMonth) return false;
        return true;
      }),
    cvv: Yup.string()
      .matches(/^[0-9]{3,4}$/, 'CVV tidak valid (3 atau 4 digit)')
      .required('CVV wajib diisi'),
  });

  // --- Formik Hook for Payment Form ---
  const formik = useFormik({
    initialValues: {
      startDate: '',
      endDate: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
    },
    validationSchema: paymentValidationSchema,
    onSubmit: async (values) => {
      // Perhitungan total harga dan jumlah hari harus dilakukan di sini atau di useEffect
      const start = new Date(values.startDate);
      const end = new Date(values.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 untuk inklusif

      if (diffDays <= 0 || !car) {
        toast.error("Terjadi kesalahan kalkulasi harga. Mohon periksa tanggal.");
        return;
      }

      try {
        const rentalRequest = {
          carId: car.id,
          startDate: values.startDate,
          endDate: values.endDate,
        };

        const response = await fetch('http://localhost:8080/api/rentals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(rentalRequest),
        });

        if (response.ok) {
          toast.success('Penyewaan berhasil diproses! Silakan tunggu konfirmasi.');
          setTimeout(() => {
            navigate('/my-rentals');
          }, 3000);
        } else {
          const errorData = await response.json().catch(() => ({}));
          toast.error(errorData.message || 'Gagal memproses penyewaan. Mohon coba lagi.');
          console.error('Failed to create rental:', errorData);
        }
      } catch (err) {
        toast.error('Terjadi kesalahan jaringan atau server saat memproses penyewaan.');
        console.error('Network error creating rental:', err);
      }
    },
  });

  // State untuk perhitungan harga (di luar Formik karena ini adalah derived state)
  const [totalPrice, setTotalPrice] = useState(0);
  const [numberOfDays, setNumberOfDays] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) {
      toast.info("Anda harus login untuk mengakses halaman pembayaran.");
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
          toast.warn("Mobil ini tidak tersedia untuk disewa.");
          navigate('/');
        }
      } catch (err) {
        toast.error(err.message || "Gagal memuat detail mobil.");
        console.error("Error fetching car details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (carId) {
      fetchCarDetails();
    }
  }, [carId, isLoggedIn, navigate]); // Ditambah toast karena digunakan di sini

  // Effect untuk perhitungan harga berdasarkan nilai Formik
  useEffect(() => {
    if (car && formik.values.startDate && formik.values.endDate) {
      const start = new Date(formik.values.startDate);
      const end = new Date(formik.values.endDate);

      // Validasi tambahan untuk tanggal berakhir tidak sebelum tanggal mulai
      if (end < start) {
        setNumberOfDays(0);
        setTotalPrice(0);
        return;
      }

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
  }, [car, formik.values.startDate, formik.values.endDate]); // Dependensi Formik values

  if (loading) return <div className="text-center p-8">Memuat detail mobil...</div>;
  if (!car) return <div className="text-center p-8">Mobil tidak ditemukan atau tidak tersedia.</div>; // Hapus text-red-500 kosong

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Detail Pembayaran Sewa Mobil</h1>
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">

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
        <form onSubmit={formik.handleSubmit} className="space-y-4"> {/* Gunakan formik.handleSubmit */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Tanggal Mulai Sewa</label>
            <input
              type="date"
              id="startDate"
              name="startDate" // Tambahkan name
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.startDate}
            />
            {formik.touched.startDate && formik.errors.startDate ? (
              <div className="text-red-500 text-sm mt-1">{formik.errors.startDate}</div>
            ) : null}
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Tanggal Selesai Sewa</label>
            <input
              type="date"
              id="endDate"
              name="endDate" // Tambahkan name
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.endDate}
            />
            {formik.touched.endDate && formik.errors.endDate ? (
              <div className="text-red-500 text-sm mt-1">{formik.errors.endDate}</div>
            ) : null}
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-2">Informasi Pembayaran (Placeholder)</h3>
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">Nomor Kartu</label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber" // Tambahkan name
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="XXXX XXXX XXXX XXXX"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.cardNumber}
            />
            {formik.touched.cardNumber && formik.errors.cardNumber ? (
              <div className="text-red-500 text-sm mt-1">{formik.errors.cardNumber}</div>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">Tanggal Kedaluwarsa</label>
              <input
                type="text"
                id="expiryDate"
                name="expiryDate" // Tambahkan name
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="MM/YY"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.expiryDate}
              />
              {formik.touched.expiryDate && formik.errors.expiryDate ? (
                <div className="text-red-500 text-sm mt-1">{formik.errors.expiryDate}</div>
              ) : null}
            </div>
            <div>
              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">CVV</label>
              <input
                type="text"
                id="cvv"
                name="cvv" // Tambahkan name
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="XXX"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.cvv}
              />
              {formik.touched.cvv && formik.errors.cvv ? (
                <div className="text-red-500 text-sm mt-1">{formik.errors.cvv}</div>
              ) : null}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition duration-300"
            disabled={formik.isSubmitting} // Nonaktifkan tombol saat form sedang disubmit
          >
            Konfirmasi & Bayar
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;