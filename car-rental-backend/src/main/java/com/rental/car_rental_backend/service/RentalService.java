// src/main/java/com/rental/carrentalbackend.service/RentalService.java
package com.rental.car_rental_backend.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.rental.car_rental_backend.dto.RentalRequest;
import com.rental.car_rental_backend.model.Car;
import com.rental.car_rental_backend.model.Rental;
import com.rental.car_rental_backend.model.User; // Mungkin dibutuhkan jika ada ImageService di sini
import com.rental.car_rental_backend.repository.CarRepository;
import com.rental.car_rental_backend.repository.RentalRepository;
import com.rental.car_rental_backend.repository.UserRepository; // Import Page

import lombok.RequiredArgsConstructor; // Import Pageable

@Service
@RequiredArgsConstructor
public class RentalService {

    private final RentalRepository rentalRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;
    // private final ImageService imageService; // Hanya jika ImageService diperlukan di sini

    // *** MODIFIKASI METODE INI UNTUK PAGINASI ***
    public Page<Rental> getAllRentals(Pageable pageable) { // Sekarang mengembalikan Page<Rental>
        return rentalRepository.findAll(pageable);
    }

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
        rental.setStatus("PENDING"); // Atur status awal

        car.setAvailable(false); // Tandai mobil tidak tersedia saat disewa (PENDING)
        carRepository.save(car);

        return rentalRepository.save(rental);
    }

    public List<Rental> getRentalsByLoggedInUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return rentalRepository.findByUser_Id(user.getId());
    }

    // *** MODIFIKASI METODE updateRentalStatus INI ***
    public Rental updateRentalStatus(Long rentalId, String newStatus) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Rental not found with ID: " + rentalId));

        Car car = rental.getCar(); // Dapatkan mobil terkait

        // Logika Transisi Status (penting untuk bisnis logic)
        switch (newStatus) {
            case "CONFIRMED":
                if (!rental.getStatus().equals("PENDING")) {
                    throw new IllegalArgumentException("Rental tidak bisa dikonfirmasi dari status: " + rental.getStatus());
                }
                rental.setStatus(newStatus);
                // Mobil harusnya sudah tidak tersedia sejak PENDING, tidak perlu diubah lagi
                break;
            case "PICKED_UP":
                if (!rental.getStatus().equals("CONFIRMED")) {
                    throw new IllegalArgumentException("Mobil hanya bisa diambil jika status CONFIRMED.");
                }
                rental.setStatus(newStatus);
                // Mobil tetap tidak tersedia
                break;
            case "RETURNED":
                if (!rental.getStatus().equals("PICKED_UP") && !rental.getStatus().equals("OVERDUE")) {
                    throw new IllegalArgumentException("Mobil hanya bisa dikembalikan jika status PICKED_UP atau OVERDUE.");
                }
                rental.setStatus(newStatus);
                // Setelah dikembalikan, mobil KEMBALI TERSEDIA jika tidak ada rental aktif lainnya
                boolean hasOtherActiveRentals = rentalRepository.findByCar_Id(car.getId()).stream()
                    .anyMatch(r -> r.getId() != rentalId && (r.getStatus().equals("PENDING") || r.getStatus().equals("CONFIRMED") || r.getStatus().equals("PICKED_UP")));

                if (!hasOtherActiveRentals) {
                    car.setAvailable(true);
                    carRepository.save(car);
                }
                break;
            case "CANCELLED":
                if (rental.getStatus().equals("RETURNED") || rental.getStatus().equals("COMPLETED")) {
                     throw new IllegalArgumentException("Rental yang sudah selesai tidak bisa dibatalkan.");
                }
                rental.setStatus(newStatus);
                // Jika dibatalkan, mobil tersedia kembali jika tidak ada rental aktif lain
                boolean hasOtherActiveRentalsOnCancel = rentalRepository.findByCar_Id(car.getId()).stream()
                    .anyMatch(r -> r.getId() != rentalId && (r.getStatus().equals("PENDING") || r.getStatus().equals("CONFIRMED") || r.getStatus().equals("PICKED_UP")));

                if (!hasOtherActiveRentalsOnCancel) {
                    car.setAvailable(true);
                    carRepository.save(car);
                }
                break;
            case "OVERDUE": // Status bisa diset manual oleh admin, atau otomatis oleh cron job
                if (!rental.getStatus().equals("PICKED_UP")) {
                     throw new IllegalArgumentException("Mobil hanya bisa OVERDUE jika status PICKED_UP.");
                }
                rental.setStatus(newStatus);
                break;
            case "COMPLETED": // Status akhir (misalnya, setelah di-audit)
                if (!rental.getStatus().equals("RETURNED")) {
                    throw new IllegalArgumentException("Rental hanya bisa COMPLETED jika sudah RETURNED.");
                }
                rental.setStatus(newStatus);
                // Mobil harusnya sudah tersedia dari status RETURNED
                break;
            default:
                throw new IllegalArgumentException("Status tidak valid: " + newStatus);
        }

        return rentalRepository.save(rental);
    }

    // *** TAMBAHKAN METODE INI UNTUK PENCARIAN DAN FILTER RENTAL ***
    public Page<Rental> searchAndFilterRentals(String searchTerm, String status, Pageable pageable) {
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
                // Cari berdasarkan username penyewa ATAU merek mobil DAN status
                // Ini akan menjadi query JPA yang sedikit kompleks, atau menggunakan Specification (lebih baik)
                // Untuk kesederhanaan, kita bisa melakukan filter setelah mengambil
                // ATAU definisikan query spesifik di RentalRepository
                // Contoh: return rentalRepository.findByUserUsernameContainingIgnoreCaseAndStatusOrCarBrandContainingIgnoreCaseAndStatus(...);
                // Untuk sekarang, kita akan lakukan filter dasar setelah mengambil semua yang cocok
                return rentalRepository.findByStatusAndUserUsernameContainingIgnoreCaseOrStatusAndCarBrandContainingIgnoreCase(
                                status, searchTerm, status, searchTerm, pageable);
            } else {
                // Hanya cari berdasarkan username penyewa ATAU merek mobil
                return rentalRepository.findByUserUsernameContainingIgnoreCaseOrCarBrandContainingIgnoreCase(searchTerm, searchTerm, pageable);
            }
        } else if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
            // Hanya filter berdasarkan status
            return rentalRepository.findByStatus(status, pageable);
        } else {
            // Tanpa search term atau filter status
            return rentalRepository.findAll(pageable);
        }
    }
}