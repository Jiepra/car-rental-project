package com.rental.car_rental_backend.service;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.rental.car_rental_backend.model.Role;
import com.rental.car_rental_backend.model.User;
import com.rental.car_rental_backend.repository.UserRepository; // Import Page

import lombok.RequiredArgsConstructor; // Import Pageable

@Service
@RequiredArgsConstructor
public class UserService { // Ini adalah UserService yang baru, jangan bingung dengan UserDetailsService di SecurityConfig

    private final UserRepository userRepository;

    // *** MODIFIKASI METODE INI UNTUK PAGINASI ***
    public Page<User> getAllUsers(Pageable pageable) { // Sekarang mengembalikan Page<User>
        return userRepository.findAll(pageable);
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public User updateUserRole(Long id, Role newRole) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setRole(newRole);
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        // Opsional: Sebelum menghapus user, Anda mungkin ingin menghapus semua rental yang terkait
        // Ini mirip dengan solusi ON DELETE CASCADE untuk mobil, tapi untuk user.
        // Jika Anda sudah menerapkan ON DELETE CASCADE di database untuk user_id di tabel rentals,
        // maka Anda tidak perlu menambahkan logika penghapusan rental di sini.
        userRepository.deleteById(id);
    }

    // *** TAMBAHKAN METODE INI UNTUK PENCARIAN PENGGUNA ***
    public Page<User> searchUsers(String searchTerm, Pageable pageable) {
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            // Spring Data JPA: cari berdasarkan username atau email
            return userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(searchTerm, searchTerm, pageable);
        } else {
            return userRepository.findAll(pageable);
        }
    }
}