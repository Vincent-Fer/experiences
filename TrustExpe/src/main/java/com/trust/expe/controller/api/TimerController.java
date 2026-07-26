package com.trust.expe.controller.api;

import com.trust.expe.dto.TimerRequest;
import com.trust.expe.model.TimerState;
import com.trust.expe.service.TimerService;
import com.trust.expe.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/timer")
@CrossOrigin(origins = "*")
public class TimerController {

    private final TimerService timerService;
    private final UserService userService;

    @Autowired
    public TimerController(TimerService timerService, UserService userService) {
        this.timerService = timerService;
        this.userService = userService;
    }

    private ResponseEntity<?> handleSession(String code) {
        String[] parts = code.split("_");
        if (parts.length < 2) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid code format");
        }
        return null;
    }

    @GetMapping("/get_timer")
    public ResponseEntity<?> getTimer(@RequestParam String code) {
        // Extract uid and ses from code (format: uid_ses_imageid)
        String[] parts = code.split("_");
        if (parts.length < 2) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid code format");
        }

        try {
            Long uid = Long.parseLong(parts[0]);
            Integer ses = Integer.parseInt(parts[1]);

            TimerState state = timerService.getTimerState(code, uid, ses);
            if (state == null) {
                // Initialize new timer
                state = timerService.setTimerState(code, uid, ses, "initial", 30);
            }

            Integer initialTime = 30;

            String dangerClass = timerService.getTimerDangerClass(state.getCountdown(), state.getPhase());

            Map<String, Object> response = new HashMap<>();
            response.put("countdown", state.getCountdown());
            response.put("phase", state.getPhase());
            response.put("class", dangerClass);
            response.put("recIA", "N/A"); // Will be set by frontend when available

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing timer");
        }
    }

    @PostMapping("/click")
    public ResponseEntity<?> handleClick(@RequestBody TimerRequest request) {
        String code = request.getObjectName(); // This actually contains the code in this case
        String objectName = request.getObjectName();

        // Part of code for handling timer advancement
        String[] parts = code.split("_");
        if (parts.length < 2) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid code format");
        }

        try {
            Long uid = Long.parseLong(parts[0]);
            Integer ses = Integer.parseInt(parts[1]);

            TimerState state = timerService.getTimerState(code, uid, ses);
            if (state == null) {
                state = timerService.setTimerState(code, uid, ses, "initial", 30);
            }

            String currentPhase = state.getPhase();

            if (currentPhase.equals("initial")) {
                if (objectName == null || objectName.equals("none")) {
                    // Move to AI phase
                    state = timerService.setTimerState(code, uid, ses, "ai", 5);

                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    return ResponseEntity.ok(response);
                }

                // Handle initial decision
                state = timerService.setTimerState(code, uid, ses, "ai", 5);

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                return ResponseEntity.ok(response);
            } else if (currentPhase.equals("ai")) {
                // Move to final phase
                state = timerService.setTimerState(code, uid, ses, "final", 10);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing click");
        }
    }

    @GetMapping("/get_timer_state")
    public ResponseEntity<?> getTimerState(@RequestParam String code) {
        try {
            String[] parts = code.split("_");
            if (parts.length < 2) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid code format");
            }

            Long uid = Long.parseLong(parts[0]);
            Integer ses = Integer.parseInt(parts[1]);

            TimerState state = timerService.getTimerState(code, uid, ses);
            if (state == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Timer state not found");
            }

            String dangerClass = "normal";

            Map<String, Object> response = new HashMap<>();
            response.put("countdown", state.getCountdown());
            response.put("phase", state.getPhase());
            response.put("class", dangerClass);
            response.put("last_active", state.getLastActive());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid parameters");
        }
    }
}
