package com.experience3.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "user_game_data")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserGameData {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private Long uid;

    @Column(name = "session_number")
    private Integer sessionNumber;

    // Données pour ListSuspectView
    @Column(name = "suspects_list")
    @Lob
    private String suspectsList;

    // Données pour SliderView
    @Column(name = "slider_value")
    private Integer sliderValue;

    @Column(name = "slider_end")
    private Boolean sliderEnd;

    // Données pour QuestionnaireView
    @Column(name = "questionnaire_data")
    @Lob
    private String questionnaireData;

    // Flags pour suivre l'état
    @Column(name = "has_submitted_suspects")
    private Boolean hasSubmittedSuspects = false;

    @Column(name = "has_submitted_slider")
    private Boolean hasSubmittedSlider = false;

    @Column(name = "has_submitted_questionnaire")
    private Boolean hasSubmittedQuestionnaire = false;
}