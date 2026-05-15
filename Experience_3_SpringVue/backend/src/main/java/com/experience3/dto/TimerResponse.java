package com.experience3.dto;

import lombok.Data;

@Data
public class TimerResponse {
    private String countdown;
    private String phase;
    private String recIA;
    private String cssClass;
    private boolean error;
}
