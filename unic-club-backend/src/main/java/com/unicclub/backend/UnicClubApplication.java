package com.unicclub.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

@SpringBootApplication
public class UnicClubApplication {
    
    public static void main(String[] args) {
        // Load .env file
        Dotenv dotenv = null;
        String currentDir = System.getProperty("user.dir");
        
        System.out.println("=== Looking for .env file ===");
        System.out.println("Current directory: " + currentDir);
        
        // Build list of absolute paths to search
        Path currentPath = Paths.get(currentDir).toAbsolutePath();
        String[] searchPaths = {
            currentPath.toString(),                                    // Current directory
            currentPath.resolve("unic-club-backend").toString(),       // If running from parent (TechnicalGuide)
            currentPath.getParent() != null ? currentPath.getParent().toString() : currentPath.toString(), // Parent directory
        };
        
        // Try each path until we find a .env file
        for (String path : searchPaths) {
            File envFile = new File(path, ".env");
            System.out.println("Checking: " + envFile.getAbsolutePath() + " - exists: " + envFile.exists());
            
            if (envFile.exists()) {
                try {
                    dotenv = Dotenv.configure()
                            .directory(path)
                            .load();
                    System.out.println("Loaded .env from: " + path);
                    break;
                } catch (Exception e) {
                    System.out.println("Failed to load from " + path + ": " + e.getMessage());
                }
            }
        }
        
//        if (dotenv != null) {
//            System.out.println("=== Loading environment variables ===");
//            dotenv.entries().forEach(entry -> {
//                String value = entry.getValue();
//                String displayValue = (entry.getKey().contains("PASSWORD") || entry.getKey().contains("SECRET"))
//                    ? "****" : value;
//                System.out.println("Setting: " + entry.getKey() + " = " + displayValue);
//                System.setProperty(entry.getKey(), value);
//            });
//            System.out.println("=====================================");
//        } else {
//            System.out.println("WARNING: No .env file found!");
//            System.out.println("Searched in:");
//            for (String path : searchPaths) {
//                System.out.println("  - " + path);
//            }
//            System.out.println("Using default values from application.yml");
//        }
        
        SpringApplication.run(UnicClubApplication.class, args);
    }
}