// src/main/java/com/rental/carrentalbackend/service/CarService.java
package com.rental.car_rental_backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rental.car_rental_backend.model.Car;
import com.rental.car_rental_backend.repository.CarRepository;

@Service
public class CarService {

    @Autowired
    private CarRepository carRepository;

    public List<Car> getAllCars() {
        return carRepository.findAll();
    }

    public Optional<Car> getCarById(Long id) {
        return carRepository.findById(id);
    }

    public Car createCar(Car car) {
        return carRepository.save(car);
    }

    public Car updateCar(Long id, Car carDetails) {
        Car car = carRepository.findById(id).orElseThrow(() -> new RuntimeException("Car not found with id: " + id));
        car.setBrand(carDetails.getBrand());
        car.setModel(carDetails.getModel());
        car.setYear(carDetails.getYear());
        car.setLicensePlate(carDetails.getLicensePlate());
        car.setDailyRate(carDetails.getDailyRate());
        car.setAvailable(carDetails.isAvailable());
        return carRepository.save(car);
    }

    public void deleteCar(Long id) {
        carRepository.deleteById(id);
    }

    public Car updateCarAvailability(Long id, boolean available) {
        Car car = carRepository.findById(id).orElseThrow(() -> new RuntimeException("Car not found with id: " + id));
        car.setAvailable(available);
        return carRepository.save(car);
    }

    // *** TAMBAHKAN METODE INI UNTUK PENCARIAN DAN FILTER ***
    public List<Car> searchAndFilterCars(String searchTerm, Boolean available) {
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            if (available != null) {
                // Cari berdasarkan merek/model DAN ketersediaan
                return carRepository.findByAvailableTrueAndBrandContainingIgnoreCaseOrAvailableTrueAndModelContainingIgnoreCase(searchTerm, searchTerm);
            } else {
                // Hanya cari berdasarkan merek/model (termasuk yang tidak tersedia jika tidak ada filter)
                return carRepository.findByBrandContainingIgnoreCaseOrModelContainingIgnoreCase(searchTerm, searchTerm);
            }
        } else if (available != null) {
            // Hanya filter berdasarkan ketersediaan (tanpa search term)
            return carRepository.findByAvailable(available);
        } else {
            // Tidak ada search term atau filter, kembalikan semua mobil
            return carRepository.findAll();
        }
    }
}