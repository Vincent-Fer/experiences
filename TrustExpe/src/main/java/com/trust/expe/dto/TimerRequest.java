package com.trust.expe.dto;

import java.util.Map;

public class TimerRequest {
    private String objectName;
    private Map<String, Object> feedback;

    public String getObjectName() {
        return objectName;
    }

    public void setObjectName(String objectName) {
        this.objectName = objectName;
    }

    public Map<String, Object> getFeedback() {
        return feedback;
    }

    public void setFeedback(Map<String, Object> feedback) {
        this.feedback = feedback;
    }
}