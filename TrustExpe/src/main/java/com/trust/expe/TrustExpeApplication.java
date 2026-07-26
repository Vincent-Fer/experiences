package com.trust.expe;

import com.trust.expe.repository.UserRepository;
import com.trust.expe.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class TrustExpeApplication {

    public static void main(String[] args) {
        SpringApplication.run(TrustExpeApplication.class, args);
    }

    @Bean
    public CommandLineRunner createTestUser(UserService userService, UserRepository userRepository) {
        return args -> {
            // Check if test user already exists
            if (!userRepository.existsByLogin("test")) {
                // Create a test user with login "test" and password "test"
                userService.createUserIfNotExists(
                    "test",
                    "test",
                    0,          // lastSession
                    0,          // lastSessionSeen
                    0,          // nbPts
                    1,          // grp
                    "Test User",// name
                    "test@example.com" // email
                );
                System.out.println("Test user created: login='test', password='test'");
            } else {
                System.out.println("Test user already exists: login='test', password='test'");
            }
        };
    }
}