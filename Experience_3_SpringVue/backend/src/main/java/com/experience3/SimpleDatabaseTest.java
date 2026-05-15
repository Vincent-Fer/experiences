package com.experience3;

import com.experience3.entity.User;
import com.experience3.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.Optional;

@SpringBootApplication
public class SimpleDatabaseTest {

    public static void main(String[] args) {
        SpringApplication.run(SimpleDatabaseTest.class, args);
    }

    @Bean
    public CommandLineRunner testUserCreation(UserRepository userRepository) {
        return args -> {
            // Check if test user already exists
            Optional<User> existingUser = userRepository.findByLogin("testVincent");

            if (existingUser.isEmpty()) {
                // Create test user
                User testUser = new User();
                testUser.setLogin("testVincent");
                testUser.setPassword("testVincent");
                testUser.setLastSession(0);
                testUser.setTimeLastSession(0L);
                testUser.setLastSessionSeen(0);
                testUser.setNbPoints(0);
                testUser.setGrp(1);
                testUser.setName("Test Vincent");
                testUser.setEmail("test.vincent@example.com");

                userRepository.save(testUser);
                System.out.println("✅ Test user 'testVincent' created successfully");
            } else {
                System.out.println("ℹ️ Test user 'testVincent' already exists");
                System.out.println("User details: " + existingUser.get());
            }

            // Verify user can be found by login and password
            Optional<User> foundUser = userRepository.findByLoginAndPassword("testVincent", "testVincent");
            if (foundUser.isPresent()) {
                System.out.println("✅ User can be authenticated with credentials");
            } else {
                System.out.println("❌ User cannot be authenticated with credentials");
            }
        };
    }
}