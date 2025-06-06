package com.rental.car_rental_backend.dto;

import lombok.Data;
@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String email;
    
}