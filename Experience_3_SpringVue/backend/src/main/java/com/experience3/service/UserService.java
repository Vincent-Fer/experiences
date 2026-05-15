package com.experience3.service;

import com.experience3.entity.User;
import com.experience3.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public Optional<User> findByLogin(String login) {
        return userRepository.findByLogin(login);
    }

    public Optional<User> findByLoginAndPassword(String login, String password) {
        return userRepository.findByLoginAndPassword(login, password);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public Optional<User> findById(Long uid) {
        return userRepository.findById(uid);
    }

      public void updateUserField(Long uid, String fieldName, Object value) {
          Optional<User> userOptional = userRepository.findById(uid);
          if (userOptional.isPresent()) {
              User user = userOptional.get();
              switch (fieldName) {
                  case "lastSession" -> user.setLastSession((Integer) value);
                  case "timeLastSession" -> user.setTimeLastSession((Long) value);
                  case "lastSessionSeen" -> user.setLastSessionSeen((Integer) value);
                  case "nbPoints" -> user.setNbPoints((Integer) value);
                  case "name" -> user.setName((String) value);
                  case "hasCompletedDemography" -> user.setHasCompletedDemography((Boolean) value);
                  case "hasSeenExplainations" -> user.setHasSeenExplainations((Boolean) value);
                  case "age" -> user.setAge((Integer) value);
                  case "genre" -> user.setGenre((String) value);
                  case "etudes" -> user.setEtudes((String) value);
                  case "classification" -> user.setClassification((String) value);
                  case "duree_classification" -> user.setDureeClassification((String) value);
                  case "utilisation_ia" -> user.setUtilisationIa((String) value);
                  case "familiarite_ia" -> user.setFamiliariteIa((Integer) value);
              }
              userRepository.save(user);
          }
      }

      public void saveDemographicQuestionnaire(Long uid, Map<String, Object> formData) {
          Optional<User> userOptional = userRepository.findById(uid);
          if (userOptional.isPresent()) {
              User user = userOptional.get();

              // Mettre à jour tous les champs du questionnaire
              if (formData.containsKey("age")) user.setAge(Integer.parseInt(formData.get("age").toString()));
              if (formData.containsKey("genre")) user.setGenre(formData.get("genre").toString());
              if (formData.containsKey("etudes")) user.setEtudes(formData.get("etudes").toString());
              if (formData.containsKey("classification")) user.setClassification(formData.get("classification").toString());
              if (formData.containsKey("duree_classification")) user.setDureeClassification(formData.get("duree_classification").toString());
              if (formData.containsKey("utilisation_ia")) user.setUtilisationIa(formData.get("utilisation_ia").toString());
              if (formData.containsKey("familiarite_ia")) user.setFamiliariteIa(Integer.parseInt(formData.get("familiarite_ia").toString()));

              // Marquer comme complété
              user.setHasCompletedDemography(true);

              userRepository.save(user);
          }
      }
}
