package com.experience3;

import com.experience3.entity.User;
import com.experience3.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;

/**
 * Classe de test pour vérifier la connexion à la base de données SQLite.
 * 
 * Instructions pour exécuter :
 * 1. Compiler le projet : mvn clean install
 * 2. Exécuter : java -cp target/experience3-backend-1.0.0.jar com.experience3.DatabaseTestMain
 */
public class DatabaseTestMain implements CommandLineRunner {

    private final UserRepository userRepository;
    
    public DatabaseTestMain(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    @Override
    public void run(String... args) throws Exception {
        System.out.println("\n=== TEST DE CONNEXION À LA BASE DE DONNÉES SQLITE ===");
        
        try {
            // Créer et sauvegarder un utilisateur de test
            User user = new User();
            user.setLogin("test_sqlite");
            user.setPassword("test123");
            user.setLastSession(1);
            user.setTimeLastSession(System.currentTimeMillis());
            user.setLastSessionSeen(1);
            user.setNbPoints(0);
            user.setGrp(1);
            user.setName("Test SQLite");
            user.setEmail("sqlite@test.com");
            
            System.out.println("Sauvegarde de l'utilisateur...");
            User savedUser = userRepository.save(user);
            System.out.println("✅ Utilisateur sauvegardé avec ID: " + savedUser.getUid());
            
            // Vérifier que l'utilisateur peut être retrouvé
            System.out.println("Recherche de l'utilisateur...");
            User foundUser = userRepository.findById(savedUser.getUid()).orElse(null);
            
            if (foundUser != null) {
                System.out.println("✅ SUCCÈS: Connexion à la base de données SQLite fonctionnelle!");
                System.out.println("   Login: " + foundUser.getLogin());
                System.out.println("   Nom: " + foundUser.getName());
            } else {
                System.out.println("❌ ÉCHEC: Impossible de retrouver l'utilisateur dans la base de données!");
            }
            
            // Nettoyer (optionnel)
            userRepository.delete(savedUser);
            System.out.println("✅ Test terminé avec succès!");
            
        } catch (Exception e) {
            System.out.println("❌ ERREUR: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("=== FIN DU TEST ===\n");
    }
    
    public static void main(String[] args) {
        // Démarrer l'application Spring Boot
        ConfigurableApplicationContext context = SpringApplication.run(Experience3Application.class, args);
        
        try {
            // Récupérer le bean DatabaseTestMain et exécuter le test
            DatabaseTestMain test = context.getBean(DatabaseTestMain.class);
            test.run(args);
        } catch (Exception e) {
            System.out.println("❌ ERREUR lors de l'exécution du test: " + e.getMessage());
            e.printStackTrace();
        } finally {
            // Fermer le contexte
            context.close();
        }
    }
}