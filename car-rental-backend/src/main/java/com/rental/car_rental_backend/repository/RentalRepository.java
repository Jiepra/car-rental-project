package com.rental.car_rental_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rental.car_rental_backend.model.Rental;

@Repository
public interface RentalRepository extends JpaRepository<Rental, Long> {
    List<Rental> findByUser_Id(Long userId);
    List<Rental> findByCar_Id(Long carId);
}