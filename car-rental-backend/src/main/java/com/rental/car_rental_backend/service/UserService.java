package com.rental.car_rental_backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.rental.car_rental_backend.model.Role;
import com.rental.car_rental_backend.model.User;
import com.rental.car_rental_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService { // Ini adalah UserService yang baru, jangan bingung dengan UserDetailsService di SecurityConfig

    private final UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
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
}