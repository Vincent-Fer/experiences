package com.trust.expe.model;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "timers")
@IdClass(TimerStateId.class)
public class TimerState implements Serializable {

    @Id
    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Id
    @Column(name = "uid", nullable = false)
    private Long uid;

    @Id
    @Column(name = "ses", nullable = false)
    private Integer ses;

    @Column(name = "phase", nullable = false)
    private String phase;

    @Column(name = "countdown", nullable = false)
    private Integer countdown;

    @Column(name = "last_active", nullable = false)
    private Long lastActive;

    public TimerState() {
    }

    public TimerState(String code, Long uid, Integer ses, String phase, Integer countdown, Long lastActive) {
        this.code = code;
        this.uid = uid;
        this.ses = ses;
        this.phase = phase;
        this.countdown = countdown;
        this.lastActive = lastActive;
    }

    // Getters and Setters

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Long getUid() {
        return uid;
    }

    public void setUid(Long uid) {
        this.uid = uid;
    }

    public Integer getSes() {
        return ses;
    }

    public void setSes(Integer ses) {
        this.ses = ses;
    }

    public String getPhase() {
        return phase;
    }

    public void setPhase(String phase) {
        this.phase = phase;
    }

    public Integer getCountdown() {
        return countdown;
    }

    public void setCountdown(Integer countdown) {
        this.countdown = countdown;
    }

    public Long getLastActive() {
        return lastActive;
    }

    public void setLastActive(Long lastActive) {
        this.lastActive = lastActive;
    }
}