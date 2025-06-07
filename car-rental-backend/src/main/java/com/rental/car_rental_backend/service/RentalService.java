// src/main/java/com/rental/carrentalbackend/service/RentalService.java
package com.rental.car_rental_backend.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.rental.car_rental_backend.dto.RentalRequest;
import com.rental.car_rental_backend.model.Car;
import com.rental.car_rental_backend.model.Rental;
import com.rental.car_rental_backend.model.User;
import com.rental.car_rental_backend.repository.CarRepository;
import com.rental.car_rental_backend.repository.RentalRepository;
import com.rental.car_rental_backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RentalService {

    private final RentalRepository rentalRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;

    public List<Rental> getAllRentals() {
        return rentalRepository.findAll();
    }

    public List<Rental> getRentalsByUserId(Long userId) {
        return rentalRepository.findByUser_Id(userId);
    }

    public Rental createRental(RentalRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found after authentication."));

        Car car = carRepository.findById(request.getCarId())
                .orElseThrow(() -> new RuntimeException("Car not found with ID: " + request.getCarId()));

        if (!car.isAvailable()) {
            throw new RuntimeException("Mobil tidak tersedia untuk disewa.");
        }
        if (request.getStartDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Tanggal mulai sewa tidak boleh di masa lalu.");
        }
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new RuntimeException("Tanggal akhir sewa harus setelah tanggal mulai sewa.");
        }

        long numberOfDays = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        if (numberOfDays <= 0) {
             numberOfDays = 1;
        }
        double totalPrice = car.getDailyRate() * numberOfDays;

        Rental rental = new Rental();
        rental.setCar(car);
        rental.setUser(currentUser);
        rental.setStartDate(request.getStartDate());
        rental.setEndDate(request.getEndDate());
        rental.setTotalPrice(totalPrice);
        rental.setStatus("PENDING");

        // Perhatikan: Mobil ditandai tidak tersedia saat disewa (PENDING)
        car.setAvailable(false);
        carRepository.save(car);

        return rentalRepository.save(rental);
    }

    public List<Rental> getRentalsByLoggedInUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return rentalRepository.findByUser_Id(user.getId());
    }

    // *** TAMBAHKAN METODE INI ***
    public Rental updateRentalStatus(Long rentalId, String newStatus) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Rental not found with ID: " + rentalId));

        // Contoh validasi status (sesuai kebutuhan bisnis Anda)
        if (!newStatus.equals("CONFIRMED") && !newStatus.equals("COMPLETED") && !newStatus.equals("CANCELLED")) {
            throw new IllegalArgumentException("Status tidak valid: " + newStatus);
        }

        rental.setStatus(newStatus);
        Rental updatedRental = rentalRepository.save(rental);

        // Jika status berubah menjadi 'COMPLETED' atau 'CANCELLED', mobil bisa jadi tersedia lagi
        if (newStatus.equals("COMPLETED") || newStatus.equals("CANCELLED")) {
            Car car = updatedRental.getCar();
            // Periksa apakah mobil ini tidak lagi terkait dengan rental aktif lainnya
            // Ini bisa menjadi logika kompleks jika satu mobil bisa punya banyak rental,
            // tapi untuk kasus sederhana, kita bisa langsung set available
            // Jika ada banyak rental untuk satu mobil, Anda harus memverifikasi apakah tidak ada rental PENDING/CONFIRMED lain untuk mobil ini
            boolean hasOtherActiveRentals = rentalRepository.findByCar_Id(car.getId()).stream()
                .anyMatch(r -> r.getId().equals(rentalId) && (r.getStatus().equals("PENDING") || r.getStatus().equals("CONFIRMED")));

            if (!hasOtherActiveRentals) {
                 car.setAvailable(true); // Hanya set tersedia jika tidak ada rental aktif lain
                 carRepository.save(car);
            }
        }
        return updatedRental;
    }
}