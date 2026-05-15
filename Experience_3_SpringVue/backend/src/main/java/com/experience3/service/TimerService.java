package com.experience3.service;

import com.experience3.config.AppConfig;
import com.experience3.entity.Timer;
import com.experience3.repository.TimerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class TimerService {

    @Autowired
    private TimerRepository timerRepository;

    @Autowired
    private AppConfig appConfig;

    public Optional<Timer> getTimerState(String code) {
        Optional<Timer> timerOptional = timerRepository.findByCode(code);
        if (timerOptional.isPresent()) {
            Timer timer = timerOptional.get();
            long currentTimeMs = System.currentTimeMillis();
            long lastActive = timer.getLastActive();
            
            // Delete if inactive for more than MIN_TO_DEL_TIMER minutes
            if (currentTimeMs - lastActive > appConfig.getMinToDelTimer() * 60 * 1000) {
                timerRepository.deleteById(code);
                return Optional.empty();
            }
        }
        return timerOptional;
    }

    public void setTimerState(String code, String phase, int countdown) {
        Timer timer = new Timer();
        timer.setCode(code);
        timer.setPhase(phase);
        timer.setCountdown(countdown);
        timer.setLastActive(System.currentTimeMillis());
        timerRepository.save(timer);
    }

    public void updateTimerLastActive(String code) {
        Optional<Timer> timerOptional = timerRepository.findByCode(code);
        if (timerOptional.isPresent()) {
            Timer timer = timerOptional.get();
            timer.setLastActive(System.currentTimeMillis());
            timerRepository.save(timer);
        }
    }
}
