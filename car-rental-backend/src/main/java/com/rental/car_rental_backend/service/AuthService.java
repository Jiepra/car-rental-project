// src/main/java/com/rental/car_rental_backend/service/AuthService.java
package com.rental.car_rental_backend.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.rental.car_rental_backend.dto.AuthResponse;
import com.rental.car_rental_backend.dto.LoginRequest;
import com.rental.car_rental_backend.dto.RegisterRequest;
import com.rental.car_rental_backend.model.Role;
import com.rental.car_rental_backend.model.User; // Pastikan Lombok terinstal dan berfungsi
import com.rental.car_rental_backend.repository.UserRepository;
import com.rental.car_rental_backend.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service // Memberi tahu Spring bahwa ini adalah komponen Service
@RequiredArgsConstructor // Dari Lombok, menghasilkan konstruktor dengan semua final field
public class AuthService {

    // Dependency Injection: Spring akan secara otomatis menyediakan instance dari bean ini
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // Untuk hashing password
    private final JwtService jwtService; // Untuk membuat dan memvalidasi JWT
    private final AuthenticationManager authenticationManager; // Untuk otentikasi user

    /**
     * Mendaftarkan pengguna baru dengan peran default CUSTOMER.
     * Password akan di-hash sebelum disimpan ke database.
     *
     * @param request Data pendaftaran pengguna (username, email, password)
     * @return AuthResponse yang berisi JWT, username, dan role
     */
     public AuthResponse register(RegisterRequest request) {
        var user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.CUSTOMER) // KEMBALIKAN KE INI: Default role adalah CUSTOMER
                .build();
        userRepository.save(user);
        var jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken, user.getUsername(), user.getRole().name());
    }

    /**
     * Melakukan login pengguna.
     * Mengotentikasi kredensial dan jika berhasil, mengembalikan JWT.
     *
     * @param request Data login pengguna (username, password)
     * @return AuthResponse yang berisi JWT, username, dan role
     * @throws org.springframework.security.core.AuthenticationException jika kredensial tidak valid
     */
    public AuthResponse login(LoginRequest request) {
        // Mengotentikasi kredensial pengguna menggunakan AuthenticationManager
        // Jika kredensial salah, AuthenticationManager akan melempar AuthenticationException
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        // Jika otentikasi berhasil (tidak ada exception yang dilempar),
        // ambil detail user dari database berdasarkan username
        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found after successful authentication. This should not happen."));
                // Exception ini seharusnya jarang terjadi jika authenticationManager berhasil

        // Membuat JSON Web Token (JWT) untuk user yang berhasil login
        var jwtToken = jwtService.generateToken(user);

        // Mengembalikan AuthResponse yang berisi token, username, dan role
        return new AuthResponse(jwtToken, user.getUsername(), user.getRole().name());
    }
}