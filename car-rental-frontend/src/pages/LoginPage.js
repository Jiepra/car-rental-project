// src/pages/LoginPage.js
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useFormik } from 'formik'; // Import useFormik
import * as Yup from 'yup'; // Import Yup

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // Definisikan skema validasi menggunakan Yup
  const validationSchema = Yup.object({
    username: Yup.string().required('Username wajib diisi'),
    password: Yup.string().required('Password wajib diisi'),
  });

  // Inisialisasi Formik
  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => { // Fungsi yang dipanggil saat form disubmit dan valid
      try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values), // values sudah berisi username dan password
        });

        const data = await response.json();

        if (response.ok) {
          login(data.token, data.username, data.role);
          toast.success(`Selamat datang, ${data.username}!`);
          navigate('/');
        } else {
          toast.error(data.message || 'Login gagal. Periksa username dan password Anda.');
          console.error('Login failed:', data);
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
        <h1 className="text-3xl font-bold text-center mb-6">Login ke Akun Anda</h1>
        <form onSubmit={formik.handleSubmit} className="space-y-5"> {/* Gunakan formik.handleSubmit */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              id="username"
              name="username" // Tambahkan name attribute
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              onChange={formik.handleChange} // Gunakan formik.handleChange
              onBlur={formik.handleBlur} // Gunakan formik.handleBlur
              value={formik.values.username} // Gunakan formik.values
            />
            {formik.touched.username && formik.errors.username ? ( // Tampilkan pesan error
              <div className="text-red-500 text-sm mt-1">{formik.errors.username}</div>
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
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={formik.isSubmitting} // Nonaktifkan tombol saat form sedang disubmit
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Belum punya akun? <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">Daftar di sini</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;