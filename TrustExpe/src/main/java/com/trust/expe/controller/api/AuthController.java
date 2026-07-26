package com.trust.expe.controller.api;

import com.trust.expe.dto.UserAuthResponse;
import com.trust.expe.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    @Autowired
    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials, HttpSession session) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        UserAuthResponse authResponse = userService.verifyCredentials(username, password);

        if (authResponse.isSuccess()) {
            // Set session attributes
            session.setAttribute("uid", authResponse.getUid());
            session.setAttribute("grp", authResponse.getGrp());
            session.setAttribute("ses", authResponse.getLastSession());
            session.setAttribute("game", false);
            session.setAttribute("endGame", false);
            session.setAttribute("questionnaire", false);
            session.setAttribute("slider", false);
            session.setAttribute("choice", 1);
            session.setAttribute("messageTps", "");
            session.setAttribute("messageSes", "");

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("success", true);
            responseData.put("uid", authResponse.getUid());

            return ResponseEntity.ok(responseData);
        } else {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Login ou mot de passe incorrect.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }

    @GetMapping("/check_session")
    public ResponseEntity<?> checkSession(HttpSession session) {
        if (session.getAttribute("uid") != null) {
            Long uid = (Long) session.getAttribute("uid");
            Integer ses = (Integer) session.getAttribute("ses");
            Integer grp = (Integer) session.getAttribute("grp");

            Map<String, Object> response = new HashMap<>();
            response.put("hasSession", true);
            response.put("uid", uid);
            response.put("ses", ses);
            response.put("grp", grp);

            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("hasSession", false);
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
}