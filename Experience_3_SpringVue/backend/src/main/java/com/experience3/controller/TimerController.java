package com.experience3.controller;

import com.experience3.config.AppConfig;
import com.experience3.dto.TimerResponse;
import com.experience3.entity.Timer;
import com.experience3.service.TimerService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/timer")
public class TimerController {

    @Autowired
    private TimerService timerService;

    @Autowired
    private AppConfig appConfig;

    @GetMapping("/state/{code}")
    public ResponseEntity<TimerResponse> getTimerState(@PathVariable String code) {
        TimerResponse response = new TimerResponse();
        
        Optional<Timer> timerOptional = timerService.getTimerState(code);
        if (timerOptional.isPresent()) {
            Timer timer = timerOptional.get();
            response.setCountdown(String.valueOf(timer.getCountdown()));
            response.setPhase(timer.getPhase());
            
            // Set CSS class based on phase
            switch (timer.getPhase()) {
                case "initial" -> response.setCssClass("timer-initial");
                case "ai" -> response.setCssClass("timer-ai");
                case "final" -> response.setCssClass("timer-final");
                default -> response.setCssClass("timer-default");
            }
            
            response.setError(false);
            timerService.updateTimerLastActive(code);
        } else {
            // Timer not found, create new one
            response.setCountdown(String.valueOf(appConfig.getInitialPhaseTimer()));
            response.setPhase("initial");
            response.setCssClass("timer-initial");
            response.setError(false);
            
            // Create new timer
            timerService.setTimerState(code, "initial", appConfig.getInitialPhaseTimer());
        }
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/update/{code}")
    public ResponseEntity<?> updateTimerState(
            @PathVariable String code,
            @RequestParam String phase,
            @RequestParam int countdown) {
        
        timerService.setTimerState(code, phase, countdown);
        return ResponseEntity.ok().body(Map.of("success", true));
    }
}
