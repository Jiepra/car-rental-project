// src/main/java/com/rental/car_rental_backend.controller/CarController.java
package com.rental.car_rental_backend.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page; // Tambahkan import Collections
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile; // Pastikan ini diimpor untuk SecurityConfig

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rental.car_rental_backend.model.Car; // Import Page
import com.rental.car_rental_backend.service.CarService; // Import Pageable

@RestController
@RequestMapping("/api/cars")
@CrossOrigin(origins = "http://localhost:3000")
public class CarController {

    @Autowired
    private CarService carService;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping
    public ResponseEntity<Page<Car>> getAllCars(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean available,
            @PageableDefault(size = 10, sort = "id") Pageable pageable
    ) {
        Page<Car> carsPage; // Ganti List menjadi Page
        if (search != null || available != null) {
            carsPage = carService.searchAndFilterCars(search, available, pageable);
        } else {
            carsPage = carService.getAllCars(pageable);
        }

        return new ResponseEntity<>(carsPage, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Car> getCarById(@PathVariable Long id) {
        return carService.getCarById(id)
                .map(car -> new ResponseEntity<>(car, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Car> createCar(
            @RequestPart("car") String carJson,
            @RequestPart(value = "image", required = false) MultipartFile imageFile
    ) {
        try {
            Car car = objectMapper.readValue(carJson, Car.class);
            Car createdCar = carService.createCar(car, imageFile);
            return new ResponseEntity<>(createdCar, HttpStatus.CREATED);
        } catch (IOException e) {
            // Bisa jadi error karena file atau JSON parsing
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<Car> updateCar(
            @PathVariable Long id,
            @RequestPart("car") String carJson,
            @RequestPart(value = "image", required = false) MultipartFile imageFile
    ) {
        try {
            Car carDetails = objectMapper.readValue(carJson, Car.class);
            Car updatedCar = carService.updateCar(id, carDetails, imageFile);
            return new ResponseEntity<>(updatedCar, HttpStatus.OK);
        } catch (IOException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND); // Jika mobil tidak ditemukan
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteCar(@PathVariable Long id) {
        try {
            carService.deleteCar(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) { // Tangkap generic Exception untuk error tak terduga
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}