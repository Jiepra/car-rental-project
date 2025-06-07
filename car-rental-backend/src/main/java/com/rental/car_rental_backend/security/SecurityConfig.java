// src/main/java/com/rental/carrentalbackend.security/SecurityConfig.java
package com.rental.car_rental_backend.security;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean; // Import ini
import org.springframework.context.annotation.Configuration; // Import ini
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable) // Nonaktifkan CSRF karena kita menggunakan JWT
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Aktifkan CORS
            .authorizeHttpRequests(authorize -> authorize
                // --- ATURAN PUBLIK (TANPA AUTHENTIKASI) ---
                .requestMatchers("/api/auth/**").permitAll() // Register, Login
                .requestMatchers("/images/**").permitAll() // Akses publik ke folder gambar (ini yang error 403 di gambar)
                .requestMatchers(HttpMethod.GET, "/api/cars").permitAll() // GET semua mobil (Home Page)
                .requestMatchers(HttpMethod.GET, "/api/cars/{id}").permitAll() // GET detail mobil (Car Detail Page)

                // --- ATURAN TERLINDUNGI (PERLU AUTHENTIKASI DAN PERAN) ---
                .requestMatchers(HttpMethod.POST, "/api/cars").hasAnyAuthority("ADMIN") // POST tambah mobil
                .requestMatchers(HttpMethod.PUT, "/api/cars/**").hasAnyAuthority("ADMIN") // PUT update mobil
                .requestMatchers(HttpMethod.DELETE, "/api/cars/**").hasAnyAuthority("ADMIN") // DELETE hapus mobil
                
                .requestMatchers(HttpMethod.GET, "/api/rentals").hasAnyAuthority("ADMIN") // GET semua rental (Admin)
                .requestMatchers(HttpMethod.GET, "/api/rentals/me").hasAnyAuthority("CUSTOMER", "ADMIN") // GET rental user yang login
                .requestMatchers(HttpMethod.PUT, "/api/rentals/{id}/status").hasAnyAuthority("ADMIN") // Update status rental

                .requestMatchers("/api/users/**").hasAnyAuthority("ADMIN") // Manajemen user oleh admin

                // --- ATURAN UMUM: SEMUA REQUEST LAINNYA HARUS TEROTENTIKASI ---
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // Gunakan stateless session (JWT)
            )
            .authenticationProvider(authenticationProvider) // Mendaftarkan AuthenticationProvider kustom kita
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class); // Menambahkan filter JWT

        return http.build();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        // Mengabaikan permintaan ke /images/** dari filter Spring Security
        // Ini memastikan aset statis dapat diakses tanpa otentikasi
        return (web) -> web.ignoring().requestMatchers(new AntPathRequestMatcher("/images/**"));
    }

    // Bean untuk konfigurasi CORS yang lebih fleksibel
    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000")); // Izinkan frontend React kita
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS")); // Mengizinkan metode HTTP
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type")); // Mengizinkan header
        configuration.setAllowCredentials(true); // Mengizinkan pengiriman kredensial
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Mendaftarkan konfigurasi CORS untuk semua path
        return source;
    }
}