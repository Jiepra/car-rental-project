package com.rental.car_rental_backend.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class RentalRequest {
    private Long carId;
    private LocalDate startDate;
    private LocalDate endDate;
    // Client tidak perlu mengirim userId atau totalPrice, itu akan dihitung di backend
}