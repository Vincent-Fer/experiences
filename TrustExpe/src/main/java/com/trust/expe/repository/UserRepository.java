package com.trust.expe.repository;

import com.trust.expe.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByLoginAndPassword(String login, String password);
    boolean existsByLogin(String login);

    @Query("SELECT u.lastSession, u.timeLastSession, u.grp FROM User u WHERE u.uid = :uid")
    Object[] findSessionInfoByUid(@Param("uid") Long uid);

    @Query("SELECT u.lastSession FROM User u WHERE u.uid = :uid")
    Integer findLastSessionByUid(@Param("uid") Long uid);

    @Query("SELECT u.timeLastSession FROM User u WHERE u.uid = :uid")
    Long findTimeLastSessionByUid(@Param("uid") Long uid);

    @Query("SELECT u.grp FROM User u WHERE u.uid = :uid")
    Integer findGrpByUid(@Param("uid") Long uid);

    @Transactional
    @Modifying
    @Query("UPDATE User u SET u.lastSession = u.lastSession + 1, u.timeLastSession = :currentTime WHERE u.uid = :uid")
    void incrementLastSession(@Param("uid") Long uid, @Param("currentTime") Long currentTime);

    @Transactional
    @Modifying
    @Query("UPDATE User u SET u.nbPoints = u.nbPoints + :points WHERE u.uid = :uid")
    void addPointsToUser(@Param("uid") Long uid, @Param("points") Integer points);

    @Transactional
    @Modifying
    @Query("UPDATE User u SET u.lastSessionSeen = :lastSessionSeen, u.name = :name WHERE u.uid = :uid")
    void setLastSessionSeenAndUpdateName(@Param("uid") Long uid,
                                         @Param("lastSessionSeen") Integer lastSessionSeen,
                                         @Param("name") String name);

    @Transactional
    @Modifying
    @Query("UPDATE User u SET u.lastSessionSeen = :lastSessionSeen WHERE u.uid = :uid")
    void setLastSessionSeen(@Param("uid") Long uid, @Param("lastSessionSeen") Integer lastSessionSeen);

    @Query("SELECT u.lastSessionSeen, u.name FROM User u WHERE u.uid = :uid")
    Object[] getLastSessionSeenAndName(@Param("uid") Long uid);

    @Query("SELECT u.lastSessionSeen FROM User u WHERE u.uid = :uid")
    Integer getLastSessionSeenByUid(@Param("uid") Long uid);

    @Query("SELECT u.name FROM User u WHERE u.uid = :uid")
    String getNameByUid(@Param("uid") Long uid);
}