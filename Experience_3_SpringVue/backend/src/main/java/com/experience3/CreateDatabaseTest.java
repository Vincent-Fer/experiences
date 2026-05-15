package com.experience3;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

/**
 * Programme simple pour créer la base de données SQLite
 * et vérifier qu'elle est accessible.
 */
public class CreateDatabaseTest {
    
    public static void main(String[] args) {
        System.out.println("=== TEST DE CRÉATION DE BASE DE DONNÉES SQLITE ===");
        
        String url = "jdbc:sqlite:C:\\Users\\Vincent\\GitProject\\experiences\\Experience_3_SpringVue\\backend\\experience3.db";
        
        try {
            // Charger le driver SQLite
            Class.forName("org.sqlite.JDBC");
            System.out.println("✅ Driver SQLite chargé avec succès");
            
            // Établir la connexion (cela crée la base de données si elle n'existe pas)
            System.out.println("Connexion à la base de données...");
            try (Connection conn = DriverManager.getConnection(url)) {
                System.out.println("✅ Connexion à la base de données établie avec succès!");
                System.out.println("✅ Fichier de base de données créé à: " + url);
                
                // Créer une table simple pour vérifier que tout fonctionne
                try (Statement stmt = conn.createStatement()) {
                    stmt.execute("CREATE TABLE IF NOT EXISTS test_table (id INTEGER PRIMARY KEY, name TEXT)");
                    System.out.println("✅ Table de test créée avec succès");
                }
            }
            
        } catch (Exception e) {
            System.out.println("❌ ERREUR: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("=== FIN DU TEST ===");
    }
}