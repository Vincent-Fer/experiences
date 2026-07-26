package com.trust.expe.service;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "trust.expe")
public class AppProperties {

    private String mediaFolder;
    private String logsFolder;
    private Integer sessionDurationMinutes;
    private Integer minBetweenSessionsHours;
    private Integer minBetweenFeedbackHours;
    private Integer sessionAkeBetweenSessions;

    // Timer phases
    private TimerPhase timerPhase;

    @Component
    public static class TimerPhase {
        private Integer initial;
        private Integer ai;
        private Integer finalPhase;

        // Getters and Setters
        public Integer getInitial() {
            return initial;
        }

        public void setInitial(Integer initial) {
            this.initial = initial;
        }

        public Integer getAi() {
            return ai;
        }

        public void setAi(Integer ai) {
            this.ai = ai;
        }

        public Integer getFinalPhase() {
            return finalPhase;
        }

        public void setFinalPhase(Integer finalPhase) {
            this.finalPhase = finalPhase;
        }
    }

    // Getters and Setters

    public String getMediaFolder() {
        return mediaFolder;
    }

    public void setMediaFolder(String mediaFolder) {
        this.mediaFolder = mediaFolder;
    }

    public String getLogsFolder() {
        return logsFolder;
    }

    public void setLogsFolder(String logsFolder) {
        this.logsFolder = logsFolder;
    }

    public Integer getSessionDurationMinutes() {
        return sessionDurationMinutes;
    }

    public void setSessionDurationMinutes(Integer sessionDurationMinutes) {
        this.sessionDurationMinutes = sessionDurationMinutes;
    }

    public Integer getMinBetweenSessionsHours() {
        return minBetweenSessionsHours != null ? minBetweenSessionsHours : 60;
    }

    public void setMinBetweenSessionsHours(Integer minBetweenSessionsHours) {
        this.minBetweenSessionsHours = minBetweenSessionsHours;
    }

    public Integer getMinBetweenFeedbackHours() {
        return minBetweenFeedbackHours != null ? minBetweenFeedbackHours : 12;
    }

    public void setMinBetweenFeedbackHours(Integer minBetweenFeedbackHours) {
        this.minBetweenFeedbackHours = minBetweenFeedbackHours;
    }

    public Integer getSessionAkeBetweenSessions() {
        return sessionAkeBetweenSessions;
    }

    public void setSessionAkeBetweenSessions(Integer sessionAkeBetweenSessions) {
        this.sessionAkeBetweenSessions = sessionAkeBetweenSessions;
    }

    public TimerPhase getTimerPhase() {
        return timerPhase;
    }

    public void setTimerPhase(TimerPhase timerPhase) {
        this.timerPhase = timerPhase;
    }
}