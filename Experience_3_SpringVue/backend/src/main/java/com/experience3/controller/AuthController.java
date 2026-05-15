package com.experience3.controller;

import com.experience3.dto.LoginRequest;
import com.experience3.entity.User;
import com.experience3.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpSession session) {
        return userService.findByLoginAndPassword(loginRequest.getUsername(), loginRequest.getPassword())
            .map(user -> {
                // Store user info in session
                session.setAttribute("uid", user.getUid());
                session.setAttribute("login", user.getLogin());
                session.setAttribute("grp", user.getGrp());
                session.setAttribute("lastSession", user.getLastSession());
                session.setAttribute("hasCompletedDemography", user.getHasCompletedDemography());
                session.setAttribute("hasSeenExplainations", user.getHasSeenExplainations());

                return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "uid", user.getUid(),
                    "lastSession", user.getLastSession(),
                    "grp", user.getGrp(),
                    "hasCompletedDemography", user.getHasCompletedDemography(),
                    "hasSeenExplainations", user.getHasSeenExplainations()
                ));
            })
            .orElse(ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Invalid credentials"
            )));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok().body(Map.of("success", true));
    }

    @GetMapping("/session")
    public ResponseEntity<?> getSession(HttpSession session) {
        Long uid = (Long) session.getAttribute("uid");
        if (uid != null) {
            return userService.findById(uid)
                .map(user -> ResponseEntity.ok().body(Map.of(
                    "authenticated", true,
                    "uid", user.getUid(),
                    "login", user.getLogin(),
                    "grp", user.getGrp(),
                    "lastSession", user.getLastSession(),
                    "hasCompletedDemography", user.getHasCompletedDemography(),
                    "hasSeenExplainations", user.getHasSeenExplainations()
                )))
                .orElse(ResponseEntity.status(401).body(Map.of("authenticated", false)));
        }
        return ResponseEntity.status(401).body(Map.of("authenticated", false));
    }

    @PostMapping("/questionnaire/demography")
    public ResponseEntity<?> submitDemographicQuestionnaire(@RequestBody Map<String, Object> formData, HttpSession session) {
        Long uid = (Long) session.getAttribute("uid");
        if (uid != null) {
            userService.saveDemographicQuestionnaire(uid, formData);
            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "message", "Questionnaire démographique enregistré avec succès"
            ));
        }
        return ResponseEntity.status(401).body(Map.of(
            "success", false,
            "message", "Utilisateur non authentifié"
        ));
    }

    @GetMapping("/questionnaire/demography")
    public ResponseEntity<?> getDemographicQuestionnaire(HttpSession session) {
        Long uid = (Long) session.getAttribute("uid");
        if (uid != null) {
            return userService.findById(uid)
                .map(user -> ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "age", user.getAge(),
                    "genre", user.getGenre(),
                    "etudes", user.getEtudes(),
                    "classification", user.getClassification(),
                    "duree_classification", user.getDureeClassification(),
                    "utilisation_ia", user.getUtilisationIa(),
                    "familiarite_ia", user.getFamiliariteIa(),
                    "hasCompletedDemography", user.getHasCompletedDemography()
                )))
                .orElse(ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Utilisateur non trouvé"
                )));
        }
        return ResponseEntity.status(401).body(Map.of(
            "success", false,
            "message", "Utilisateur non authentifié"
        ));
    }
}
