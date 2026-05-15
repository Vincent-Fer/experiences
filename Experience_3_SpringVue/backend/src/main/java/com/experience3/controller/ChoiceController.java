package com.experience3.controller;

import com.experience3.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/choice")
public class ChoiceController {

    @Autowired
    private UserService userService;

    @PostMapping("/update")
    public ResponseEntity<?> updateChoice(
            @RequestParam String fieldName,
            @RequestParam Object value,
            HttpSession httpSession) {
        
        Long uid = (Long) httpSession.getAttribute("uid");
        if (uid == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        
        userService.updateUserField(uid, fieldName, value);
        return ResponseEntity.ok().body(Map.of("success", true));
    }
}
