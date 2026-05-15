package com.experience3;

import com.experience3.entity.User;
import com.experience3.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class TestUserInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    public TestUserInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Check if test user already exists
        Optional<User> existingUser = userRepository.findByLogin("testVincent");

        if (existingUser.isEmpty()) {
            // Create test user
            User testUser = new User();
            testUser.setLogin("testVincent");
            testUser.setPassword("testVincent"); // Note: In production, this should be encoded
            testUser.setLastSession(0);
            testUser.setTimeLastSession(0L);
            testUser.setLastSessionSeen(0);
            testUser.setNbPoints(0);
            testUser.setGrp(1); // Default group
            testUser.setName("Test Vincent");
            testUser.setEmail("test.vincent@example.com");

            userRepository.save(testUser);
            System.out.println("Test user 'testVincent' created successfully");
        } else {
            System.out.println("Test user 'testVincent' already exists");
        }
    }
}