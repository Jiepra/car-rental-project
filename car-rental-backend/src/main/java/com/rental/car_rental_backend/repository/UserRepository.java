// src/main/java/com/rental/carrentalbackend/repository/UserRepository.java
package com.rental.car_rental_backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rental.car_rental_backend.model.User; // Import Page

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    // JpaRepository sudah menyediakan:
    // List<User> findAll();
    // Optional<User> findById(Long id);
    // User save(User user);
    // void deleteById(Long id);
    
}