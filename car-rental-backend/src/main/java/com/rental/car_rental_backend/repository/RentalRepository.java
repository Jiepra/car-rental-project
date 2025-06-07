package com.rental.car_rental_backend.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rental.car_rental_backend.model.Rental;

@Repository
public interface RentalRepository extends JpaRepository<Rental, Long> {
    List<Rental> findByUser_Id(Long userId);
    List<Rental> findByCar_Id(Long carId);

    // *** TAMBAHKAN METODE INI ***
    Page<Rental> findByStatus(String status, Pageable pageable);
    Page<Rental> findByUserUsernameContainingIgnoreCaseOrCarBrandContainingIgnoreCase(String username, String carBrand, Pageable pageable);
    // Untuk search term DAN status (lebih kompleks, perlu dua parameter status)
    Page<Rental> findByStatusAndUserUsernameContainingIgnoreCaseOrStatusAndCarBrandContainingIgnoreCase(String status1, String username, String status2, String carBrand, Pageable pageable);

}