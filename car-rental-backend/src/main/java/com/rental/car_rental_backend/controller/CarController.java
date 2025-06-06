package com.rental.car_rental_backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rental.car_rental_backend.model.Car;
import com.rental.car_rental_backend.service.CarService;

@RestController
@RequestMapping("/api/cars")
@CrossOrigin(origins = "http://localhost:3000") // Izinkan frontend React di port 3000
public class CarController {

    @Autowired
    private CarService carService;

    @GetMapping
    public ResponseEntity<List<Car>> getAllCars(
            @RequestParam(required = false) String search, // Parameter untuk pencarian
            @RequestParam(required = false) Boolean available // Parameter untuk filter ketersediaan
    ) {
        List<Car> cars;
        if (search != null || available != null) {
            cars = carService.searchAndFilterCars(search, available);
        } else {
            cars = carService.getAllCars();
        }
        return new ResponseEntity<>(cars, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Car> getCarById(@PathVariable Long id) {
        return carService.getCarById(id)
                .map(car -> new ResponseEntity<>(car, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<Car> createCar(@RequestBody Car car) {
        Car createdCar = carService.createCar(car);
        return new ResponseEntity<>(createdCar, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Car> updateCar(@PathVariable Long id, @RequestBody Car carDetails) {
        try {
            Car updatedCar = carService.updateCar(id, carDetails);
            return new ResponseEntity<>(updatedCar, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteCar(@PathVariable Long id) {
        try {
            carService.deleteCar(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}