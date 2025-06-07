// src/main/java/com/rental/carrentalbackend/repository/CarRepository.java
package com.rental.car_rental_backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rental.car_rental_backend.model.Car;

@Repository
public interface CarRepository extends JpaRepository<Car, Long> {
    
    // Metode untuk mencari mobil berdasarkan merek atau model (case-insensitive)
    Page<Car> findByBrandContainingIgnoreCaseOrModelContainingIgnoreCase(String brand, String model, Pageable pageable);

    // Metode untuk mencari mobil berdasarkan ketersediaan
    Page<Car> findByAvailable(boolean available, Pageable pageable);

    // Metode untuk mencari berdasarkan merek/model DAN ketersediaan
    Page<Car> findByAvailableTrueAndBrandContainingIgnoreCaseOrAvailableTrueAndModelContainingIgnoreCase(String brand, String model, Pageable pageable);

    // Jika Anda ingin mengembalikan semua mobil (tanpa filter/search), findAll() sudah ada.
    // Metode kustom untuk kombinasi yang lebih fleksibel, akan diimplementasikan di Service
}