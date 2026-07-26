package com.trust.expe.dto;

public class UserAuthResponse {
    private boolean success;
    private Long uid;
    private Integer lastSession;
    private Integer grp;

    public UserAuthResponse() {
    }

    public UserAuthResponse(boolean success, Long uid, Integer lastSession, Integer grp) {
        this.success = success;
        this.uid = uid;
        this.lastSession = lastSession;
        this.grp = grp;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public Long getUid() {
        return uid;
    }

    public void setUid(Long uid) {
        this.uid = uid;
    }

    public Integer getLastSession() {
        return lastSession;
    }

    public void setLastSession(Integer lastSession) {
        this.lastSession = lastSession;
    }

    public Integer getGrp() {
        return grp;
    }

    public void setGrp(Integer grp) {
        this.grp = grp;
    }
}