package com.experience3.service;

import com.experience3.config.AppConfig;
import com.experience3.entity.User;
import com.experience3.entity.UserGameData;
import com.experience3.repository.UserGameDataRepository;
import com.experience3.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
public class GameService {

    @Autowired
    private AppConfig appConfig;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserGameDataRepository userGameDataRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String[] SUSPECT_LIST = {
        "Suspect 1", "Suspect 2", "Suspect 3", "Suspect 4", "Suspect 5",
        "Suspect 6", "Suspect 7", "Suspect 8", "Suspect 9", "Suspect 10",
        "Suspect 11", "Suspect 12", "Suspect 13", "Suspect 14", "Suspect 15"
    };

    public Map<String, Object> getGameData(Long uid, int session) {
        Map<String, Object> gameData = new HashMap<>();

        // Get suspect list
        gameData.put("sus", Arrays.asList(SUSPECT_LIST));

        // Get vessel data
        Map<String, String> vesDict = generateVesselData();
        gameData.put("ves_dict", vesDict);

        // Get vessel image (base64 encoded)
        String vesselImage = getBase64Image("mission" + session + "/vessels/1.jpg");
        gameData.put("vessel_image", vesselImage);

        // Get TAC image (base64 encoded)
        String tacImage = getBase64Image("mission" + session + "/64nm/1.png");
        gameData.put("encoded_image", tacImage);

        return gameData;
    }

    public Map<String, String> generateVesselData() {
        Map<String, String> vesDict = new HashMap<>();

        // AIS Data
        vesDict.put("vspeedAIS", String.valueOf(10 + (int)(Math.random() * 15)));
        vesDict.put("vheadAIS", String.valueOf(45 + (int)(Math.random() * 90)));
        vesDict.put("vlengthAIS", String.valueOf(50 + (int)(Math.random() * 100)));
        vesDict.put("vwidth", String.valueOf(10 + (int)(Math.random() * 20)));
        vesDict.put("vLastAIS", formatDateTime(LocalDateTime.now().minusHours(1)));
        vesDict.put("vtype", "Cargo");
        vesDict.put("vname", "Vessel" + (int)(Math.random() * 1000));
        vesDict.put("vnat", "FR");
        vesDict.put("vmmsi", String.valueOf(100000000 + (int)(Math.random() * 900000000)));
        vesDict.put("vimo", String.valueOf(1000000 + (int)(Math.random() * 9000000)));
        vesDict.put("vfrom", "Marseille");
        vesDict.put("vto", "Tunis");
        vesDict.put("vstatus", "Underway using engine");
        vesDict.put("vbuilt", String.valueOf(2000 + (int)(Math.random() * 20)));
        vesDict.put("vweight", String.valueOf(1000 + (int)(Math.random() * 5000)));
        vesDict.put("vdraught", String.valueOf(5 + (int)(Math.random() * 10)));

        // Sensor Data
        vesDict.put("vspeedReal", String.valueOf(9 + (int)(Math.random() * 17)));
        vesDict.put("vheadReal", String.valueOf(40 + (int)(Math.random() * 100)));
        vesDict.put("vlengthReal", String.valueOf(48 + (int)(Math.random() * 104)));
        vesDict.put("vDistAIS", String.format("%.2f", 0.1 + Math.random() * 0.5));
        vesDict.put("inMaritimeRoad", Math.random() > 0.5 ? "Oui" : "Non");
        vesDict.put("inFishingZone", Math.random() > 0.7 ? "Oui" : "Non");
        vesDict.put("inCoastZone", Math.random() > 0.3 ? "Oui" : "Non");
        vesDict.put("nearOtherVessel", Math.random() > 0.6 ? "Oui" : "Non");
        vesDict.put("protectedZone", Math.random() > 0.8 ? "Oui" : "Non");

        // AI Recommendation
        vesDict.put("recIA", Math.random() > 0.5 ? "suspect" : "neutre");
        vesDict.put("expIA", "Analyse des données de navigation");
        vesDict.put("gt", Math.random() > 0.5 ? "suspect" : "neutre");

        return vesDict;
    }

    public List<Map<String, Object>> getFeedbackData(Long uid, int session) {
        List<Map<String, Object>> feedbackList = new ArrayList<>();

        // Read user data from CSV
        String csvPath = Paths.get(appConfig.getImageFolder(), "mission" + session, "users", "1.csv").toString();
        List<String[]> userData = readCSVFile(csvPath);

        // Generate feedback for 6 cases
        for (int i = 0; i < 6; i++) {
            Map<String, Object> feedback = new HashMap<>();

            // Get vessel data
            Map<String, String> vesDict = generateVesselData();

            // Get images
            String imgTac = getBase64Image("mission" + session + "/64nm/" + (i+1) + ".png");
            String imgVes = getBase64Image("mission" + session + "/vessels/" + (i+1) + ".jpg");

            feedback.put("image_id", i+1);
            feedback.put("imgTac", imgTac);
            feedback.put("imgVes", imgVes);
            feedback.put("decIni", formatDecision(vesDict.get("gt")));
            feedback.put("recIA", formatDecision(vesDict.get("recIA")));
            feedback.put("expIA", vesDict.get("expIA"));
            feedback.put("decFin", formatDecision(vesDict.get("gt")));
            feedback.put("gt", formatDecision(vesDict.get("gt")));
            feedback.put("decIniTime", "00:15");
            feedback.put("decFinTime", "00:25");
            feedback.put("ves_dict", vesDict);

            feedbackList.add(feedback);
        }

        return feedbackList;
    }

    public List<Integer> getRank(Long uid, int session) {
        List<Integer> rankData = new ArrayList<>(Arrays.asList(0, 0, 0, 0, 0, 0, 0, 0, 0));

        // Simulate rank data
        rankData.set(0, 100 + (int)(Math.random() * 50)); // Top user points
        rankData.set(1, (int)(Math.random() * 3)); // Top user initial time exceeded
        rankData.set(2, (int)(Math.random() * 2)); // Top user final time exceeded

        rankData.set(3, 80 + (int)(Math.random() * 40)); // User ahead points
        rankData.set(4, (int)(Math.random() * 2)); // User ahead initial time exceeded
        rankData.set(5, (int)(Math.random() * 1)); // User ahead final time exceeded

        rankData.set(6, 70 + (int)(Math.random() * 30)); // Current user points
        rankData.set(7, (int)(Math.random() * 2)); // Current user initial time exceeded
        rankData.set(8, (int)(Math.random() * 1)); // Current user final time exceeded

        return rankData;
    }

    public boolean canStartNewSession(Long uid) {
        Optional<User> userOptional = userRepository.findById(uid);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            long currentTimeMs = System.currentTimeMillis();
            long lastSessionTimeMs = user.getTimeLastSession();

            // Check if enough time has passed since last session
            long hoursSinceLastSession = TimeUnit.MILLISECONDS.toHours(currentTimeMs - lastSessionTimeMs);
            return hoursSinceLastSession >= appConfig.getInterSessionHours();
        }
        return false;
    }

    public boolean canViewFeedback(Long uid, int session) {
        Optional<User> userOptional = userRepository.findById(uid);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            long currentTimeMs = System.currentTimeMillis();
            long lastSessionTimeMs = user.getTimeLastSession();

            // Check if enough time has passed since last session for feedback
            long hoursSinceLastSession = TimeUnit.MILLISECONDS.toHours(currentTimeMs - lastSessionTimeMs);
            return hoursSinceLastSession >= appConfig.getTimeFeedbackHours();
        }
        return false;
    }

    public int getTimeFeedbackHours() {
        return appConfig.getTimeFeedbackHours();
    }

    private String getBase64Image(String relativePath) {
        try {
            String fullPath = Paths.get(appConfig.getImageFolder(), relativePath).toString();
            File file = new File(fullPath);
            if (file.exists()) {
                byte[] fileContent = java.nio.file.Files.readAllBytes(file.toPath());
                return Base64.getEncoder().encodeToString(fileContent);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return ""; // Return empty string if image not found
    }

    private List<String[]> readCSVFile(String filePath) {
        List<String[]> records = new ArrayList<>();
        try (CSVReader csvReader = new CSVReader(new FileReader(filePath))) {
            records = csvReader.readAll();
        } catch (IOException | CsvException e) {
            e.printStackTrace();
        }
        return records;
    }

    private String formatDateTime(LocalDateTime dateTime) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return dateTime.format(formatter);
    }

    private String formatDecision(String decision) {
        if ("suspect".equals(decision)) {
            return "<span style=\"color: red; font-weight: bold\">Suspect</span>";
        } else {
            return "<span style=\"color: green; font-weight: bold\">Neutre</span>";
        }
    }

    // Méthodes pour ListSuspectView
    public List<Map<String, Object>> getSuspectsList(Long uid) {
        List<Map<String, Object>> suspects = new ArrayList<>();
        for (int i = 0; i < SUSPECT_LIST.length; i++) {
            Map<String, Object> suspect = new HashMap<>();
            suspect.put("id", i + 1);
            suspect.put("name", SUSPECT_LIST[i]);
            suspect.put("selected", false);
            suspects.add(suspect);
        }
        return suspects;
    }

    public boolean saveSuspectsList(Long uid, Map<String, Object> data) {
        try {
            // Récupérer la session actuelle de l'utilisateur
            Optional<User> userOptional = userRepository.findById(uid);
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                int sessionNumber = user.getLastSession();

                // Trouver ou créer les données de jeu pour cet utilisateur et cette session
                Optional<UserGameData> gameDataOptional = userGameDataRepository.findByUidAndSessionNumber(uid, sessionNumber);
                UserGameData gameData = gameDataOptional.orElse(new UserGameData());

                // Mettre à jour les données
                gameData.setUid(uid);
                gameData.setSessionNumber(sessionNumber);
                gameData.setSuspectsList(objectMapper.writeValueAsString(data));
                gameData.setHasSubmittedSuspects(true);

                userGameDataRepository.save(gameData);
                return true;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    // Méthodes pour SliderView
    public Map<String, Object> getSliderData(Long uid) {
        Map<String, Object> sliderData = new HashMap<>();
        sliderData.put("end", false); // Par défaut, le slider n'est pas à la fin

        // Récupérer les données existantes si elles existent
        Optional<User> userOptional = userRepository.findById(uid);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            int sessionNumber = user.getLastSession();

            Optional<UserGameData> gameDataOptional = userGameDataRepository.findByUidAndSessionNumber(uid, sessionNumber);
            if (gameDataOptional.isPresent()) {
                UserGameData gameData = gameDataOptional.get();
                sliderData.put("end", gameData.getSliderEnd() != null ? gameData.getSliderEnd() : false);
            }
        }

        return sliderData;
    }

    public boolean saveSliderData(Long uid, Map<String, Object> data) {
        try {
            // Récupérer la session actuelle de l'utilisateur
            Optional<User> userOptional = userRepository.findById(uid);
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                int sessionNumber = user.getLastSession();

                // Trouver ou créer les données de jeu pour cet utilisateur et cette session
                Optional<UserGameData> gameDataOptional = userGameDataRepository.findByUidAndSessionNumber(uid, sessionNumber);
                UserGameData gameData = gameDataOptional.orElse(new UserGameData());

                // Mettre à jour les données
                gameData.setUid(uid);
                gameData.setSessionNumber(sessionNumber);
                gameData.setSliderValue((Integer) data.get("value"));
                gameData.setSliderEnd((Boolean) data.get("end"));
                gameData.setHasSubmittedSlider(true);

                userGameDataRepository.save(gameData);
                return true;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    // Méthodes pour QuestionnaireView
    public boolean saveQuestionnaireData(Long uid, Map<String, Object> data) {
        try {
            // Récupérer la session actuelle de l'utilisateur
            Optional<User> userOptional = userRepository.findById(uid);
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                int sessionNumber = user.getLastSession();

                // Trouver ou créer les données de jeu pour cet utilisateur et cette session
                Optional<UserGameData> gameDataOptional = userGameDataRepository.findByUidAndSessionNumber(uid, sessionNumber);
                UserGameData gameData = gameDataOptional.orElse(new UserGameData());

                // Mettre à jour les données
                gameData.setUid(uid);
                gameData.setSessionNumber(sessionNumber);
                gameData.setQuestionnaireData(objectMapper.writeValueAsString(data));
                gameData.setHasSubmittedQuestionnaire(true);

                userGameDataRepository.save(gameData);
                return true;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }
}