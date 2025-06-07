// src/main/java/com/rental/carrentalbackend/controller/RentalController.java
package com.rental.car_rental_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping; // Import HttpMethod
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rental.car_rental_backend.dto.RentalRequest;
import com.rental.car_rental_backend.model.Rental;
import com.rental.car_rental_backend.service.RentalService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/rentals")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class RentalController {

    private final RentalService rentalService;

    // Endpoint untuk mendapatkan semua rental (mungkin hanya untuk admin)
    // Di SecurityConfig, ini akan diatur untuk ADMIN saja
    @GetMapping
    public ResponseEntity<List<Rental>> getAllRentals() {
        List<Rental> rentals = rentalService.getAllRentals();
        return new ResponseEntity<>(rentals, HttpStatus.OK);
    }

    // Endpoint untuk membuat pesanan rental
    @PostMapping
    public ResponseEntity<Rental> createRental(@RequestBody RentalRequest request) {
        try {
            Rental newRental = rentalService.createRental(request);
            return new ResponseEntity<>(newRental, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    // Endpoint untuk mendapatkan rental oleh user yang sedang login
    @GetMapping("/me")
    public ResponseEntity<List<Rental>> getMyRentals(Authentication authentication) {
        List<Rental> myRentals = rentalService.getRentalsByLoggedInUser(authentication.getName());
        return new ResponseEntity<>(myRentals, HttpStatus.OK);
    }

    // *** TAMBAHKAN ENDPOINT INI ***
    // Endpoint untuk mengupdate status rental (hanya admin)
    @PutMapping("/{id}/status") // PUT /api/rentals/{id}/status
    public ResponseEntity<Rental> updateRentalStatus(@PathVariable Long id, @RequestBody String newStatus) {
        try {
            Rental updatedRental = rentalService.updateRentalStatus(id, newStatus);
            return new ResponseEntity<>(updatedRental, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST); // Status tidak valid
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND); // Rental tidak ditemukan
        }
    }
}