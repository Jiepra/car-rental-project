package com.rental.car_rental_backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cars")
@Data // From Lombok: generates getters, setters, toString, equals, hashCode
@NoArgsConstructor // From Lombok: generates a no-argument constructor
@AllArgsConstructor // From Lombok: generates a constructor with all arguments
public class Car {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String brand;
    private String model;
    private String year;
    private String licensePlate; // Nomor Plat
    private double dailyRate; // Harga sewa per hari
    private boolean available; // Status ketersediaan

    // Konstruktor, getter, dan setter akan otomatis dibuat oleh Lombok (@Data)
}