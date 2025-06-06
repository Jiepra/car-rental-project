// src/main/java/com/rental/carrentalbackend/controller/RentalController.java
package com.rental.car_rental_backend.controller;

import com.rental.car_rental_backend.dto.RentalRequest;
import com.rental.car_rental_backend.model.Rental;
import com.rental.car_rental_backend.service.RentalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication; // Import Authentication
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rentals")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class RentalController {

    private final RentalService rentalService;

    // Endpoint untuk mendapatkan semua rental (mungkin hanya untuk admin)
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

    // *** TAMBAHKAN ENDPOINT INI ***
    // Endpoint untuk mendapatkan rental oleh user yang sedang login
    @GetMapping("/me") // Misalnya /api/rentals/me
    public ResponseEntity<List<Rental>> getMyRentals(Authentication authentication) {
        // Spring Security secara otomatis mengisi objek Authentication dengan detail user yang login
        // Username dari user yang login bisa didapatkan dari authentication.getName()
        List<Rental> myRentals = rentalService.getRentalsByLoggedInUser(authentication.getName());
        return new ResponseEntity<>(myRentals, HttpStatus.OK);
    }

    // Anda bisa menambahkan endpoint GET /api/rentals/{rentalId} untuk detail rental tertentu jika diperlukan
}