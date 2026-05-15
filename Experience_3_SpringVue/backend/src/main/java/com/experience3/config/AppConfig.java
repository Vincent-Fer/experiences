package com.experience3.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Value("${app.image-folder}")
    private String imageFolder;

    @Value("${app.phase-timers.initial}")
    private int initialPhaseTimer;

    @Value("${app.phase-timers.ai}")
    private int aiPhaseTimer;

    @Value("${app.phase-timers.final}")
    private int finalPhaseTimer;

    @Value("${app.inter-session-hours}")
    private int interSessionHours;

    @Value("${app.time-feedback-hours}")
    private int timeFeedbackHours;

    @Value("${app.min-to-del-timer}")
    private int minToDelTimer;

    public String getImageFolder() {
        return imageFolder;
    }

    public int getInitialPhaseTimer() {
        return initialPhaseTimer;
    }

    public int getAiPhaseTimer() {
        return aiPhaseTimer;
    }

    public int getFinalPhaseTimer() {
        return finalPhaseTimer;
    }

    public int getInterSessionHours() {
        return interSessionHours;
    }

    public int getTimeFeedbackHours() {
        return timeFeedbackHours;
    }

    public int getMinToDelTimer() {
        return minToDelTimer;
    }
}
