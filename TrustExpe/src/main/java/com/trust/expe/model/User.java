package com.trust.expe.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long uid;

    @Column(name = "login", nullable = false, unique = true)
    private String login;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "lastSession", nullable = false)
    private Integer lastSession;

    @Column(name = "timeLastSession", nullable = false)
    private Long timeLastSession;

    @Column(name = "lastSessionSeen", nullable = false)
    private Integer lastSessionSeen;

    @Column(name = "nbPoints", nullable = false)
    private Integer nbPoints;

    @Column(name = "grp", nullable = false)
    private Integer grp;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email", nullable = false)
    private String email;

    public User() {
    }

    public User(String login, String password, Integer lastSession, Long timeLastSession,
                Integer lastSessionSeen, Integer nbPoints, Integer grp, String name, String email) {
        this.login = login;
        this.password = password;
        this.lastSession = lastSession;
        this.timeLastSession = timeLastSession;
        this.lastSessionSeen = lastSessionSeen != null ? lastSessionSeen : 0;
        this.nbPoints = nbPoints != null ? nbPoints : 0;
        this.grp = grp;
        this.name = name;
        this.email = email;
    }

    // Getters and Setters

    public Long getUid() {
        return uid;
    }

    public void setUid(Long uid) {
        this.uid = uid;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Integer getLastSession() {
        return lastSession;
    }

    public void setLastSession(Integer lastSession) {
        this.lastSession = lastSession;
    }

    public Long getTimeLastSession() {
        return timeLastSession;
    }

    public void setTimeLastSession(Long timeLastSession) {
        this.timeLastSession = timeLastSession;
    }

    public Integer getLastSessionSeen() {
        return lastSessionSeen;
    }

    public void setLastSessionSeen(Integer lastSessionSeen) {
        this.lastSessionSeen = lastSessionSeen;
    }

    public Integer getNbPoints() {
        return nbPoints;
    }

    public void setNbPoints(Integer nbPoints) {
        this.nbPoints = nbPoints;
    }

    public Integer getGrp() {
        return grp;
    }

    public void setGrp(Integer grp) {
        this.grp = grp;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}