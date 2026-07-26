package com.trust.expe.service;

import com.trust.expe.model.TimerState;
import com.trust.expe.model.TimerStateId;
import com.trust.expe.repository.TimerStateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Calendar;
import java.util.Date;

@Service
public class TimerService {

    private final TimerStateRepository timerStateRepository;
    private final UserService userService;
    private final AppProperties appProperties;

    @Autowired
    public TimerService(TimerStateRepository timerStateRepository, UserService userService, AppProperties appProperties) {
        this.timerStateRepository = timerStateRepository;
        this.userService = userService;
        this.appProperties = appProperties;
    }

    public TimerState getTimerState(String code, Long uid, Integer ses) {
        TimerState timerState = timerStateRepository.findByCode(code);

        if (timerState == null) {
            return null; // First visit - initialize in the controller
        }

        Long now = getCurrentTimeInMillis();
        Long lastActive = timerState.getLastActive();

        // Delete if inactive for more than MIN_TO_DEL_TIMER minutes
        if (now - lastActive > 10 * 60 * 1000) {
            timerStateRepository.deleteByCode(code);
            return null;
        }

        return timerState;
    }

    public TimerState setTimerState(String code, Long uid, Integer ses, String phase, Integer countdown) {
        Long now = getCurrentTimeInMillis();
        TimerState timerState = timerStateRepository.findByCode(code);

        if (timerState != null) {
            timerState.setPhase(phase);
            timerState.setCountdown(countdown);
            timerState.setLastActive(now);
            timerStateRepository.updateTimerState(timerState.getCode(), timerState.getPhase(), timerState.getCountdown(), timerState.getLastActive());
            return timerState;
        } else {
            timerState = new TimerState(code, uid, ses, phase, countdown, now);
            timerStateRepository.updateTimerState(timerState.getCode(), timerState.getPhase(), timerState.getCountdown(), timerState.getLastActive());
            return timerState;
        }
    }

    public TimerState advanceTimerPhase(String code, Long uid, Integer ses) {
        TimerState timerState = timerStateRepository.findByCode(code);
        if (timerState == null) {
            return null;
        }

        AppProperties.TimerPhase timerPhase = appProperties.getTimerPhase();
        Integer countdown = timerState.getCountdown();

        if (countdown > 0) {
            countdown--;
        } else {
            String currentPhase = timerState.getPhase();

            switch (currentPhase) {
                case "initial":
                    timerState.setPhase("ai");
                    timerState.setCountdown(5);
                    break;
                case "ai":
                    timerState.setPhase("final");
                    timerState.setCountdown(10);
                    break;
                case "final":
                    timerState.setPhase("initial");
                    timerState.setCountdown(30);
                    break;
            }
        }

        timerState.setLastActive(getCurrentTimeInMillis());
        timerStateRepository.updateTimerState(timerState.getCode(), timerState.getPhase(), timerState.getCountdown(), timerState.getLastActive());
        return timerState;
    }

    public String getTimerDangerClass(Integer countdown, String currentPhase) {
        AppProperties.TimerPhase timerPhase = appProperties.getTimerPhase();

        if (timerPhase == null) {
            return "normal";
        }

        Integer totalTime = 30; // Default to initial phase time
        if (currentPhase.equals("ai")) {
            totalTime = 5;
        } else if (currentPhase.equals("final")) {
            totalTime = 10;
        }

        if (countdown >= (totalTime * 2 / 3)) {
            return "normal";
        } else if (countdown >= (totalTime / 3)) {
            return "warning";
        } else {
            return "danger";
        }
    }

    private Long getCurrentTimeInMillis() {
        return System.currentTimeMillis();
    }

    // Helper method to convert current phases from Flask
    public String getPhaseClassName(String currentPhase) {
        switch (currentPhase) {
            case "initial":
                return "INITIAL";
            case "ai":
                return "AI";
            case "final":
                return "FINAL";
            default:
                return "INITIAL";
        }
    }

    public TimerState decrementCountdown(String code) {
        TimerState timerState = timerStateRepository.findByCode(code);
        if (timerState != null && timerState.getCountdown() > 0) {
            timerState.setCountdown(timerState.getCountdown() - 1);
            timerState.setLastActive(getCurrentTimeInMillis());
        timerStateRepository.updateTimerState(timerState.getCode(), timerState.getPhase(), timerState.getCountdown(), timerState.getLastActive());
        return timerState;
        }
        return timerState;
    }
}