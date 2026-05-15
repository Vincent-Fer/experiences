package com.experience3.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long uid;

    @Column(nullable = false, unique = true)
    private String login;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private Integer lastSession;

    @Column(nullable = false)
    private Long timeLastSession;

    @Column(nullable = false)
    private Integer lastSessionSeen;

    @Column(nullable = false)
    private Integer nbPoints;

    @Column(nullable = false)
    private Integer grp;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private Boolean hasCompletedDemography = false;

    @Column(nullable = false)
    private Boolean hasSeenExplainations = false;

    // Champs pour le questionnaire démographique
    @Column
    private Integer age;

    @Column
    private String genre;

    @Column
    private String etudes;

    @Column
    private String classification;

    @Column(name = "duree_classification")
    private String dureeClassification;

    @Column(name = "utilisation_ia")
    private String utilisationIa;

    @Column(name = "familiarite_ia")
    private Integer familiariteIa;
}
