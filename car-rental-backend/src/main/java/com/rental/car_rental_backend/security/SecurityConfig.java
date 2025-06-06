// src/main/java/com/rental/car_rental_backend/security/SecurityConfig.java
package com.rental.car_rental_backend.security;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.RequiredArgsConstructor;

@Configuration // Menandakan kelas ini adalah kelas konfigurasi Spring
@EnableWebSecurity // Mengaktifkan fungsionalitas keamanan web Spring Security
@RequiredArgsConstructor // Dari Lombok, menghasilkan konstruktor dengan semua final field
public class SecurityConfig {

    // Inject JwtAuthenticationFilter dan AuthenticationProvider yang telah kita buat
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean // Menandakan metode ini akan menghasilkan bean yang dikelola oleh Spring
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable) // Menonaktifkan CSRF karena kita menggunakan JWT (stateless)
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Mengaktifkan konfigurasi CORS yang telah didefinisikan
            .authorizeHttpRequests(authorize -> authorize // Mengatur aturan otorisasi untuk permintaan HTTP
                .requestMatchers("/api/auth/**").permitAll() // Mengizinkan semua permintaan ke /api/auth/ (register, login) tanpa otentikasi
                .requestMatchers("/api/cars").permitAll() // Mengizinkan semua melihat daftar mobil (Home Page)
                .requestMatchers("/api/cars/{id}").permitAll() // Mengizinkan semua melihat daftar mobil (Home Page)
                .requestMatchers("/api/cars/**").hasAnyAuthority("ADMIN") // Hanya ADMIN yang bisa mengelola (CRUD) mobil
                .requestMatchers("/api/rentals/**").hasAnyAuthority("CUSTOMER", "ADMIN") // User dengan peran CUSTOMER atau ADMIN dapat mengakses rental
                .requestMatchers("/api/users/**").hasAnyAuthority("ADMIN") // Hanya ADMIN yang dapat mengelola user
                .anyRequest().authenticated() // Semua permintaan lain harus terotentikasi
            )
            .sessionManagement(session -> session // Mengatur manajemen sesi
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // Menggunakan sesi stateless (penting untuk JWT)
            )
            .authenticationProvider(authenticationProvider) // Mendaftarkan AuthenticationProvider kustom kita
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class); // Menambahkan filter JWT sebelum filter otentikasi username/password bawaan Spring Security

        return http.build(); // Membangun dan mengembalikan SecurityFilterChain
    }

    // Bean untuk konfigurasi CORS yang lebih fleksibel
    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Mengizinkan asal frontend React kita
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        // Mengizinkan metode HTTP yang akan digunakan
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // Mengizinkan header tertentu yang dikirim dari frontend
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        // Mengizinkan pengiriman kredensial (seperti cookies atau header Authorization)
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Mendaftarkan konfigurasi CORS untuk semua path (/**)
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}