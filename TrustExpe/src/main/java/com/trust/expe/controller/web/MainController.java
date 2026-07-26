package com.trust.expe.controller.web;

import com.trust.expe.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/")
public class MainController {

    private final UserService userService;

    @Autowired
    public MainController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public String index(HttpSession session) {
        if (session.getAttribute("uid") != null) {
            return determineNextPage(session);
        }
        return "redirect:/login";
    }

    @GetMapping("/login")
    public String login(Model model, HttpSession session) {
        if (session.getAttribute("uid") != null) {
            return determineNextPage(session);
        }
        return "login";
    }

    @PostMapping("/login")
    public String handleLogin(
            @RequestParam String username,
            @RequestParam String password,
            HttpSession session,
            Model model) {

        // For now, we'll redirect to the choice page if credentials match our test user
        if ("test".equals(username) && "test".equals(password)) {
            // Manually set session attributes (simulating successful login)
            session.setAttribute("uid", 1L); // Using 1 as a placeholder
            session.setAttribute("grp", 1);
            session.setAttribute("ses", 0);
            session.setAttribute("game", false);
            session.setAttribute("endGame", false);
            session.setAttribute("questionnaire", false);
            session.setAttribute("slider", false);
            session.setAttribute("choice", 1);
            session.setAttribute("messageTps", "");
            session.setAttribute("messageSes", "");

            // Determine the next page based on user flow logic
            return determineNextPage(session);
        } else {
            model.addAttribute("message", "Login ou mot de passe incorrect.");
            return "login";
        }
    }

    @GetMapping("/choice")
    public String choice(Model model, HttpSession session) {
        if (session.getAttribute("uid") == null) {
            return "redirect:/login";
        }
        return "choice";
    }

    @GetMapping("/explainations")
    public String explainations(Model model, HttpSession session) {
        if (session.getAttribute("uid") == null) {
            return "redirect:/login";
        }
        return "explainations";
    }

    @PostMapping("/explainations")
    public String handleExplainationsPost(HttpSession session) {
        if (session.getAttribute("uid") == null) {
            return "redirect:/login";
        }
        return "redirect:/choice";
    }

    @GetMapping("/questionnaireDemography")
    public String questionnaireDemography(Model model, HttpSession session) {
        if (session.getAttribute("uid") == null) {
            return "redirect:/login";
        }
        return "questionnaireDemography";
    }

    @PostMapping("/questionnaireDemography")
    public String handleQuestionnaireDemographyPost(HttpSession session) {
        if (session.getAttribute("uid") == null) {
            return "redirect:/login";
        }
        return "redirect:/explainations";
    }

    @PostMapping("/sendQuestionnaireDemography")
    public String handleSendQuestionnaireDemographyPost(HttpSession session) {
        if (session.getAttribute("uid") == null) {
            return "redirect:/login";
        }
        return "redirect:/explainations";
    }

    @GetMapping("/questionnaire")
    public String questionnaire(Model model, HttpSession session) {
        if (session.getAttribute("uid") == null) {
            return "redirect:/login";
        }
        return "questionnaire";
    }

    @PostMapping("/questionnaire")
    public String handleQuestionnairePost(HttpSession session) {
        if (session.getAttribute("uid") == null) {
            return "redirect:/login";
        }
        return "redirect:/slider";
    }

    @GetMapping("/slider")
    public String slider(Model model, HttpSession session) {
        if (session.getAttribute("uid") == null) {
            return "redirect:/login";
        }
        return "slider";
    }

    @PostMapping("/slider")
    public String handleSliderPost(HttpSession session) {
        if (session.getAttribute("uid") == null) {
            return "redirect:/login";
        }
        return "redirect:/listSuspect";
    }

    @GetMapping("/listSuspect")
    public String listSuspect(Model model, HttpSession session) {
        if (session.getAttribute("uid") == null) {
            return "redirect:/login";
        }
        return "listSuspect";
    }

    @PostMapping("/listSuspect")
    public String handleListSuspectPost(HttpSession session) {
        if (session.getAttribute("uid") == null) {
            return "redirect:/login";
        }
        // Simulate game flow - after listSuspect, go to game
        return "redirect:/game";
    }

    @GetMapping("/game")
    public String game(Model model, HttpSession session) {
        if (session.getAttribute("uid") == null) {
            return "redirect:/login";
        }
        return "game";
    }

    @GetMapping("/endGame")
    public String endGame(Model model, HttpSession session) {
        if (session.getAttribute("uid") == null) {
            return "redirect:/login";
        }
        return "endGame";
    }

    @PostMapping("/endGame")
    public String handleEndGamePost(HttpSession session) {
        if (session.getAttribute("uid") == null) {
            return "redirect:/login";
        }
        return "redirect:/choice";
    }

    @GetMapping("/feedback")
    public String feedback(Model model, HttpSession session) {
        if (session.getAttribute("uid") == null) {
            return "redirect:/login";
        }
        return "feedback";
    }

    private String determineNextPage(HttpSession session) {
        Long uid = (Long) session.getAttribute("uid");

        // Check if this is the user's first session
        Integer lastSession = userService.getLastSession(uid);

        if (lastSession == null || lastSession == 0) {
            // First session - go through the initial flow
            return "redirect:/questionnaireDemography";
        } else {
            // Subsequent sessions - go to choice page
            return "redirect:/choice";
        }
    }
}