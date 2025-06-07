// src/main/java/com/rental/carrentalbackend.service/ImageService.java
package com.rental.car_rental_backend.service;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import javax.imageio.ImageIO;

import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service; // Import Arrays
import org.springframework.web.multipart.MultipartFile; // Import List

@Service
public class ImageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    // Daftar jenis file yang diizinkan
    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList("image/jpeg", "image/png", "image/gif");
    private static final long MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB (Bytes)

    public String saveImage(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("File tidak boleh kosong.");
        }

        // Validasi Tipe File
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
            throw new IOException("Jenis file tidak diizinkan. Hanya JPEG, PNG, GIF.");
        }

        BufferedImage bimg = ImageIO.read(new ByteArrayInputStream(file.getBytes()));
        if (bimg == null) { // Gagal membaca sebagai gambar (misal, file corrupt)
            throw new IOException("File tidak dapat dibaca sebagai gambar.");
        }
        int width = bimg.getWidth();
        int height = bimg.getHeight();

        // Contoh batasan resolusi
        if (width > 2000 || height > 2000) {
            throw new IOException("Resolusi gambar terlalu besar (max 2000x2000 piksel).");
        }

        // Validasi Ukuran File
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IOException("Ukuran file melebihi batas maksimal (2MB).");
        }

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        String originalFileName = file.getOriginalFilename();
        String fileExtension = FilenameUtils.getExtension(originalFileName);
        String uniqueFileName = UUID.randomUUID().toString() + "." + fileExtension;

        Path filePath = uploadPath.resolve(uniqueFileName);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return "/images/" + uniqueFileName;
    }

    public void deleteImage(String imageUrl) throws IOException {
        if (imageUrl == null || imageUrl.isEmpty() || !imageUrl.startsWith("/images/")) {
            return;
        }
        String fileName = Paths.get(imageUrl).getFileName().toString();
        Path filePath = Paths.get(uploadDir).resolve(fileName).toAbsolutePath().normalize();

        if (Files.exists(filePath)) {
            Files.delete(filePath);
        }
    }
}