package com.experience3;

import com.experience3.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Test Spring Boot pour vérifier que le contexte peut se charger
 * et que les repositories sont disponibles.
 */
@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
public class DatabaseTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    public void testContextLoads() {
        // Ce test vérifie simplement que le contexte Spring peut se charger
        assertNotNull(userRepository, "UserRepository devrait être disponible");
        System.out.println("✅ Contexte Spring chargé avec succès");
        System.out.println("✅ UserRepository disponible: " + (userRepository != null));
    }
    
    @Test
    public void testDatabaseConnectionSimple() {
        // Vérifier que le repository est fonctionnel
        assertNotNull(userRepository, "UserRepository devrait être disponible");
        
        // Vérifier que la base de données est accessible
        // en appelant une méthode simple du repository
        try {
            userRepository.count();
            System.out.println("✅ Connexion à la base de données fonctionnelle");
        } catch (Exception e) {
            fail("La connexion à la base de données a échoué: " + e.getMessage());
        }
    }
}
