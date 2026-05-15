package com.experience3.controller;

import com.experience3.dto.TimerResponse;
import com.experience3.service.GameService;
import com.experience3.service.TimerService;
import com.experience3.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/game")
public class GameController {

    @Autowired
    private GameService gameService;

    @Autowired
    private TimerService timerService;

    @Autowired
    private UserService userService;

    @GetMapping("/data/{session}")
    public ResponseEntity<?> getGameData(@PathVariable int session, HttpSession httpSession) {
        Long uid = (Long) httpSession.getAttribute("uid");
        if (uid == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        
        Map<String, Object> gameData = gameService.getGameData(uid, session);
        return ResponseEntity.ok().body(gameData);
    }

    @GetMapping("/feedback/{session}")
    public ResponseEntity<?> getFeedback(@PathVariable int session, HttpSession httpSession) {
        Long uid = (Long) httpSession.getAttribute("uid");
        if (uid == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        
        if (!gameService.canViewFeedback(uid, session)) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Feedback not available yet",
                "message", "You need to wait " + gameService.getTimeFeedbackHours() + " hours after your last session to view feedback."
            ));
        }
        
        List<Map<String, Object>> feedbackData = gameService.getFeedbackData(uid, session);
        return ResponseEntity.ok().body(Map.of("feedback", feedbackData));
    }

    @GetMapping("/rank/{session}")
    public ResponseEntity<?> getRank(@PathVariable int session, HttpSession httpSession) {
        Long uid = (Long) httpSession.getAttribute("uid");
        if (uid == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        
        List<Integer> rankData = gameService.getRank(uid, session);
        return ResponseEntity.ok().body(Map.of("rank", rankData));
    }

    @PostMapping("/update-session")
    public ResponseEntity<?> updateSession(@RequestParam int session, HttpSession httpSession) {
        Long uid = (Long) httpSession.getAttribute("uid");
        if (uid == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        
        userService.updateUserField(uid, "lastSession", session);
        userService.updateUserField(uid, "timeLastSession", System.currentTimeMillis());
        
        return ResponseEntity.ok().body(Map.of("success", true));
    }

    @GetMapping("/can-start-session/{session}")
    public ResponseEntity<?> canStartNewSession(@PathVariable int session, HttpSession httpSession) {
        Long uid = (Long) httpSession.getAttribute("uid");
        if (uid == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        
        boolean canStart = gameService.canStartNewSession(uid);
        return ResponseEntity.ok().body(Map.of("canStart", canStart));
    }

    @GetMapping("/suspects")
    public ResponseEntity<?> getSuspectsList(HttpSession httpSession) {
        Long uid = (Long) httpSession.getAttribute("uid");
        if (uid == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        List<Map<String, Object>> suspects = gameService.getSuspectsList(uid);
        return ResponseEntity.ok().body(Map.of("suspects", suspects));
    }

    @PostMapping("/submit-suspects")
    public ResponseEntity<?> submitSuspectsList(@RequestBody Map<String, Object> data, HttpSession httpSession) {
        Long uid = (Long) httpSession.getAttribute("uid");
        if (uid == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        boolean success = gameService.saveSuspectsList(uid, data);
        return ResponseEntity.ok().body(Map.of(
            "success", success,
            "message", success ? "Suspects list submitted successfully" : "Failed to submit suspects list"
        ));
    }

    @GetMapping("/slider-data")
    public ResponseEntity<?> getSliderData(HttpSession httpSession) {
        Long uid = (Long) httpSession.getAttribute("uid");
        if (uid == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        Map<String, Object> sliderData = gameService.getSliderData(uid);
        return ResponseEntity.ok().body(sliderData);
    }

    @PostMapping("/submit-slider")
    public ResponseEntity<?> submitSliderData(@RequestBody Map<String, Object> data, HttpSession httpSession) {
        Long uid = (Long) httpSession.getAttribute("uid");
        if (uid == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        boolean success = gameService.saveSliderData(uid, data);
        return ResponseEntity.ok().body(Map.of(
            "success", success,
            "message", success ? "Slider data submitted successfully" : "Failed to submit slider data"
        ));
    }

    @PostMapping("/submit-questionnaire")
    public ResponseEntity<?> submitQuestionnaire(@RequestBody Map<String, Object> data, HttpSession httpSession) {
        Long uid = (Long) httpSession.getAttribute("uid");
        if (uid == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        boolean success = gameService.saveQuestionnaireData(uid, data);
        return ResponseEntity.ok().body(Map.of(
            "success", success,
            "message", success ? "Questionnaire submitted successfully" : "Failed to submit questionnaire"
        ));
    }
}
