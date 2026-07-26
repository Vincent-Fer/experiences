package com.trust.expe.model;

import java.io.Serializable;
import java.util.Objects;

public class TimerStateId implements Serializable {

    private String code;
    private Long uid;
    private Integer ses;

    public TimerStateId() {
    }

    public TimerStateId(String code, Long uid, Integer ses) {
        this.code = code;
        this.uid = uid;
        this.ses = ses;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TimerStateId that = (TimerStateId) o;
        return Objects.equals(code, that.code) &&
                Objects.equals(uid, that.uid) &&
                Objects.equals(ses, that.ses);
    }

    @Override
    public int hashCode() {
        return Objects.hash(code, uid, ses);
    }
}