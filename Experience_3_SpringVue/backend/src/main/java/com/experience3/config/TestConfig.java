package com.experience3.config;

import com.experience3.DatabaseTestMain;
import com.experience3.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Configuration pour les tests de base de données.
 */
@Configuration
@Profile("test")
public class TestConfig {

    @Bean
    public DatabaseTestMain databaseTestMain(UserRepository userRepository) {
        return new DatabaseTestMain(userRepository);
    }
}