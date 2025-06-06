// src/main/java/com/rental/carrentalbackend/repository/CarRepository.java
package com.rental.car_rental_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rental.car_rental_backend.model.Car;

@Repository
public interface CarRepository extends JpaRepository<Car, Long> {
    // Metode untuk mencari mobil berdasarkan merek atau model (case-insensitive)
    List<Car> findByBrandContainingIgnoreCaseOrModelContainingIgnoreCase(String brand, String model);

    // Metode untuk mencari mobil berdasarkan ketersediaan
    List<Car> findByAvailable(boolean available);

    // Metode untuk mencari berdasarkan merek/model DAN ketersediaan
    List<Car> findByAvailableTrueAndBrandContainingIgnoreCaseOrAvailableTrueAndModelContainingIgnoreCase(String brand, String model);

    // Jika Anda ingin mengembalikan semua mobil (tanpa filter/search), findAll() sudah ada.
    // Metode kustom untuk kombinasi yang lebih fleksibel, akan diimplementasikan di Service
}