// src/pages/RegisterPage.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useFormik } from 'formik'; // Import useFormik
import * as Yup from 'yup'; // Import Yup

const RegisterPage = () => {
  const navigate = useNavigate();

  // Definisikan skema validasi menggunakan Yup
  const validationSchema = Yup.object({
    username: Yup.string()
      .min(3, 'Username minimal 3 karakter')
      .max(20, 'Username maksimal 20 karakter')
      .required('Username wajib diisi'),
    email: Yup.string()
      .email('Format email tidak valid')
      .required('Email wajib diisi'),
    password: Yup.string()
      .min(6, 'Password minimal 6 karakter')
      .required('Password wajib diisi'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Password dan konfirmasi password tidak cocok')
      .required('Konfirmasi password wajib diisi'),
  });

  // Inisialisasi Formik
  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: validationSchema, // Gunakan skema validasi Yup
    onSubmit: async (values) => { // Fungsi yang dipanggil saat form disubmit dan valid
      try {
        const response = await fetch('http://localhost:8080/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: values.username,
            email: values.email,
            password: values.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success('Pendaftaran berhasil! Silakan login.');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          toast.error(data.message || 'Pendaftaran gagal. Mohon coba lagi.');
          console.error('Registration failed:', data);
        }
      } catch (err) {
        toast.error('Terjadi kesalahan jaringan atau server. Mohon coba lagi.');
        console.error('Network error:', err);
      }
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Daftar Akun Baru</h1>
        <form onSubmit={formik.handleSubmit} className="space-y-5"> {/* Gunakan formik.handleSubmit */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              id="username"
              name="username" // Tambahkan name attribute
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              onChange={formik.handleChange} // Gunakan formik.handleChange
              onBlur={formik.handleBlur} // Gunakan formik.handleBlur untuk validasi saat fokus hilang
              value={formik.values.username} // Gunakan formik.values
            />
            {formik.touched.username && formik.errors.username ? ( // Tampilkan pesan error
              <div className="text-red-500 text-sm mt-1">{formik.errors.username}</div>
            ) : null}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email" // Tambahkan name attribute
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="text-red-500 text-sm mt-1">{formik.errors.email}</div>
            ) : null}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              name="password" // Tambahkan name attribute
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="text-red-500 text-sm mt-1">{formik.errors.password}</div>
            ) : null}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Konfirmasi Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword" // Tambahkan name attribute
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.confirmPassword}
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
              <div className="text-red-500 text-sm mt-1">{formik.errors.confirmPassword}</div>
            ) : null}
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={formik.isSubmitting} // Nonaktifkan tombol saat form sedang disubmit
          >
            Daftar
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Sudah punya akun? <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Login di sini</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;