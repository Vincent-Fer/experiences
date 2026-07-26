package com.trust.expe.service;

import com.trust.expe.dto.UserAuthResponse;
import com.trust.expe.model.User;
import com.trust.expe.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Calendar;
import java.util.Date;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AppProperties appProperties;

    @Autowired
    public UserService(UserRepository userRepository, AppProperties appProperties) {
        this.userRepository = userRepository;
        this.appProperties = appProperties;
    }

    public UserAuthResponse verifyCredentials(String username, String password) {
        Optional<User> userOpt = userRepository.findByLoginAndPassword(username, password);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return new UserAuthResponse(true, user.getUid(), user.getLastSession(), user.getGrp());
        }
        return new UserAuthResponse(false, null, null, null);
    }

    public Integer[] getSessionInfo(Long uid) {
        Object[] result = userRepository.findSessionInfoByUid(uid);
        if (result != null && result.length == 3) {
            return new Integer[]{(Integer) result[0], (Long) result[1] > 0 ? (Integer) result[1] : null, (Integer) result[2]};
        }
        return new Integer[]{0, 0, 0};
    }

    public Integer getLastSession(Long uid) {
        return userRepository.findLastSessionByUid(uid);
    }

    public Integer getGroup(Long uid) {
        return userRepository.findGrpByUid(uid);
    }

    public void createUserIfNotExists(String login, String password, Integer lastSession,
                                     Integer lastSessionSeen, Integer nbPts, Integer grp,
                                     String name, String email) {
        // Simplified for now - in Flask this would check for existence
        User user = new User(login, password, lastSession != null ? lastSession : 0,
                            System.currentTimeMillis(), lastSessionSeen, nbPts, grp, name, email);
        userRepository.save(user);
    }

    public void setLastSessionSeen(Long uid, Integer lastSessionSeen) {
        String currentTimeHash = String.valueOf(System.currentTimeMillis());
        userRepository.setLastSessionSeenAndUpdateName(uid, lastSessionSeen, currentTimeHash);
    }

    public void addPointsToUser(Long uid, Integer points) {
        userRepository.addPointsToUser(uid, points);
    }

    public boolean canStartNewSession(Long uid) {
        if (getLastSession(uid) == 0) {
            return true; // First session
        }

        Long timeLastSession = userRepository.findTimeLastSessionByUid(uid);
        if (timeLastSession == null) return true;

        Long now = System.currentTimeMillis();
        Long diffHours = (long)((now - timeLastSession) / (1000 * 60 * 60));

        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date(timeLastSession));
        cal.add(Calendar.DAY_OF_YEAR, 2);
        cal.set(Calendar.HOUR_OF_DAY, 6);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);

        Long timeNextSession = cal.getTimeInMillis();
        diffHours = (long)((now - timeNextSession) / (1000 * 60 * 60));

        return diffHours >= appProperties.getMinBetweenSessionsHours();
    }

    public String getTimerRemainingForSession(Long uid) {
        if (getLastSession(uid) == 0) {
            return "ok";
        }

        Long timeLastSession = userRepository.findTimeLastSessionByUid(uid);
        if (timeLastSession == null) return "ok";

        Long now = System.currentTimeMillis();
        Long diffHours = (long)((now - timeLastSession) / (1000 * 60 * 60));

        if (diffHours >= appProperties.getMinBetweenSessionsHours()) {
            return "ok";
        }

        Long timeUntilNextSession = appProperties.getMinBetweenSessionsHours() * 60 * 60 * 1000 -
                                    (now - timeLastSession);

        long hours = timeUntilNextSession / (1000 * 60 * 60);
        timeUntilNextSession %= (1000 * 60 * 60);
        long minutes = timeUntilNextSession / (1000 * 60);
        timeUntilNextSession %= (1000 * 60);
        long seconds = timeUntilNextSession / 1000;

        return String.format("%02dh%02dm%02ds", hours, minutes, seconds);
    }

    public boolean canProvideFeedback(Long uid) {
        Integer lastSessionSeen = userRepository.getLastSessionSeenByUid(uid);
        if (lastSessionSeen == null || lastSessionSeen == 0) {
            return false;
        }

        Long timeLastFeedback = userRepository.findTimeLastSessionByUid(uid);
        if (timeLastFeedback == null) return false;

        Long now = System.currentTimeMillis();
        Long diffHours = (long)((now - timeLastFeedback) / (1000 * 60 * 60));

        if (diffHours >= appProperties.getMinBetweenFeedbackHours()) {
            return true;
        }

        return false;
    }

    public String getTimeUntilNextFeedback(Long uid) {
        Integer cond = userRepository.getLastSessionSeenByUid(uid);
        if (cond == null || cond == 0) {
            return "0";
        }

        Long timeLastSession = userRepository.findTimeLastSessionByUid(uid);
        if (timeLastSession == null) {
            return "0";
        }

        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date(timeLastSession));
        cal.add(Calendar.DAY_OF_YEAR, 1);
        cal.set(Calendar.HOUR_OF_DAY, 6);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);

        Long nextDayTime = cal.getTimeInMillis();
        Long now = System.currentTimeMillis();

        if (now >= nextDayTime) {
            return "ok";
        }

        Long timeUntilNextFeedback = nextDayTime - now;

        long hours = timeUntilNextFeedback / (1000 * 60 * 60);
        timeUntilNextFeedback %= (1000 * 60 * 60);
        long minutes = timeUntilNextFeedback / (1000 * 60);
        timeUntilNextFeedback %= (1000 * 60);
        long seconds = timeUntilNextFeedback / 1000;

        return String.format("%02dh%02dm%02ds", hours, minutes, seconds);
    }
}