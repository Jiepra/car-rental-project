package com.rental.car_rental_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rental.car_rental_backend.model.Role;
import com.rental.car_rental_backend.model.User;
import com.rental.car_rental_backend.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000") // Izinkan frontend React
public class UserController {

    private final UserService userService;

    @GetMapping // GET /api/users (hanya admin)
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping("/{id}") // GET /api/users/{id} (hanya admin)
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(user -> new ResponseEntity<>(user, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Endpoint untuk update role user (hanya admin)
    // Request body: {"role": "ADMIN"} atau {"role": "CUSTOMER"}
    @PutMapping("/{id}/role") // PUT /api/users/{id}/role
    public ResponseEntity<User> updateUserRole(@PathVariable Long id, @RequestBody String roleString) {
        try {
            // Konversi string ke enum Role
            Role newRole = Role.valueOf(roleString.toUpperCase());
            User updatedUser = userService.updateUserRole(id, newRole);
            return new ResponseEntity<>(updatedUser, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST); // Jika roleString tidak valid
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND); // Jika user tidak ditemukan
        }
    }

    @DeleteMapping("/{id}") // DELETE /api/users/{id} (hanya admin)
    public ResponseEntity<HttpStatus> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content for successful deletion
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}