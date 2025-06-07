// src/main/java/com/rental/carrentalbackend/CarRentalBackendApplication.java
package com.rental.car_rental_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// @EnableConfigurationProperties(FileUploadProperties.class) // Jika Anda membuat kelas config properties khusus
@SpringBootApplication
public class CarRentalBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(CarRentalBackendApplication.class, args);
	}

}