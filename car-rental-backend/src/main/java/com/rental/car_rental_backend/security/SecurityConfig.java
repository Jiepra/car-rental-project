// src/main/java/com/rental/car_rental_backend/security/SecurityConfig.java
package com.rental.car_rental_backend.security;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {


    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/cars").permitAll()
                .requestMatchers("/api/cars/{id}").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/cars").hasAnyAuthority("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/cars/**").hasAnyAuthority("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/cars/**").hasAnyAuthority("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/rentals").hasAnyAuthority("ADMIN") // GET all rentals only for ADMIN
                .requestMatchers(HttpMethod.GET, "/api/rentals/me").hasAnyAuthority("CUSTOMER", "ADMIN") // GET my rentals for CUSTOMER & ADMIN
                .requestMatchers(HttpMethod.PUT, "/api/rentals/{id}/status").hasAnyAuthority("ADMIN") // <--- TAMBAH BARIS INI
                .requestMatchers("/api/users/**").hasAnyAuthority("ADMIN")
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
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