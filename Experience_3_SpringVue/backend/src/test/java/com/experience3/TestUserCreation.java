package com.experience3;

import com.experience3.entity.User;
import com.experience3.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class TestUserCreation {

    @Autowired
    private UserRepository userRepository;

    @Test
    public void testCreateAndFindTestUser() {
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
        }

        // Verify user can be found by login
        Optional<User> foundUser = userRepository.findByLogin("testVincent");
        assertTrue(foundUser.isPresent(), "User should be found by login");

        // Verify user can be authenticated
        Optional<User> authenticatedUser = userRepository.findByLoginAndPassword("testVincent", "testVincent");
        assertTrue(authenticatedUser.isPresent(), "User should be authenticated with credentials");

        System.out.println("✅ User authentication test passed");
    }
}