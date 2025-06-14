// src/main/java/com/rental/car_rental_backend.service/CarService.java
package com.rental.car_rental_backend.service;

import java.io.IOException;
import java.util.Optional; // Tambahkan import jika belum ada

import org.springframework.beans.factory.annotation.Autowired; // Tambahkan import jika belum ada
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service; // Tambahkan import Collections
import org.springframework.web.multipart.MultipartFile;

import com.rental.car_rental_backend.model.Car;
import com.rental.car_rental_backend.repository.CarRepository;

@Service
public class CarService {

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private ImageService imageService;

    // *** MODIFIKASI METODE INI UNTUK PAGINASI ***
    public Page<Car> getAllCars(Pageable pageable) { // Sekarang mengembalikan Page<Car>
        return carRepository.findAll(pageable);
    }

    public Optional<Car> getCarById(Long id) {
        return carRepository.findById(id);
    }

    public Car createCar(Car car, MultipartFile imageFile) throws IOException {
        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = imageService.saveImage(imageFile);
            car.setImageUrl(imageUrl);
        }
        return carRepository.save(car);
    }

    public Car updateCar(Long id, Car carDetails, MultipartFile imageFile) throws IOException {
        Car car = carRepository.findById(id).orElseThrow(() -> new RuntimeException("Car not found with id: " + id));

        if (imageFile != null && !imageFile.isEmpty()) {
            if (car.getImageUrl() != null && !car.getImageUrl().isEmpty()) {
                imageService.deleteImage(car.getImageUrl());
            }
            String newImageUrl = imageService.saveImage(imageFile);
            car.setImageUrl(newImageUrl);
        } else if (carDetails.getImageUrl() == null || carDetails.getImageUrl().isEmpty()) {
            // Jika imageFile null/kosong dan imageUrl di carDetails juga kosong (berarti ingin menghapus gambar)
            if (car.getImageUrl() != null && !car.getImageUrl().isEmpty()) {
                imageService.deleteImage(car.getImageUrl());
            }
            car.setImageUrl(null);
        }
        // Jika tidak ada file baru dan imageUrl di carDetails tidak kosong, biarkan imageUrl lama tetap ada.

        car.setBrand(carDetails.getBrand());
        car.setModel(carDetails.getModel());
        car.setYear(carDetails.getYear());
        car.setLicensePlate(carDetails.getLicensePlate());
        car.setDailyRate(carDetails.getDailyRate());
        car.setAvailable(carDetails.isAvailable());
        return carRepository.save(car);
    }

    public void deleteCar(Long id) throws IOException {
        Car car = carRepository.findById(id).orElseThrow(() -> new RuntimeException("Car not found with id: " + id));
        
        // Hapus gambar terkait saat mobil dihapus
        if (car.getImageUrl() != null && !car.getImageUrl().isEmpty()) {
            imageService.deleteImage(car.getImageUrl());
        }
        carRepository.deleteById(id);
    }

    // *** KOREKSI LOGIKA searchAndFilterCars DAN updateCarAvailability ***
    // Logika ini harus mengembalikan List<Car> atau Car, bukan null

    public Car updateCarAvailability(Long id, boolean available) {
        Car car = carRepository.findById(id).orElseThrow(() -> new RuntimeException("Car not found with id: " + id));
        car.setAvailable(available);
        return carRepository.save(car);
    }

    // *** MODIFIKASI METODE INI UNTUK PAGINASI DAN FILTER ***
    public Page<Car> searchAndFilterCars(String searchTerm, Boolean available, Pageable pageable) {
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            if (available != null) {
                // Perlu metode kustom di repository yang menerima Pageable
                // Untuk sementara, jika tidak ada implementasi khusus dengan Pageable untuk kombinasi ini,
                // kita bisa memfilter dari findAll dan kemudian convert ke Page (kurang efisien untuk data besar)
                // ATAU membuat query custom di repo (disarankan)
                // Untuk sekarang, kita akan asumsikan kita punya findBy* dengan Pageable
                return carRepository.findByAvailableTrueAndBrandContainingIgnoreCaseOrAvailableTrueAndModelContainingIgnoreCase(searchTerm, searchTerm, pageable);
            } else {
                return carRepository.findByBrandContainingIgnoreCaseOrModelContainingIgnoreCase(searchTerm, searchTerm, pageable);
            }
        } else if (available != null) {
            return carRepository.findByAvailable(available, pageable); // Perlu metode ini di repo
        } else {
            return carRepository.findAll(pageable);
        }
    }
}