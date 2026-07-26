package com.trust.expe.repository;

import com.trust.expe.model.TimerState;
import com.trust.expe.model.TimerStateId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface TimerStateRepository extends JpaRepository<TimerState, TimerStateId> {

    @Query("SELECT t FROM TimerState t WHERE t.code = :code")
    TimerState findByCode(@Param("code") String code);

    @Transactional
    @Modifying
    @Query("DELETE FROM TimerState t WHERE t.code = :code")
    void deleteByCode(@Param("code") String code);

    @Transactional
    @Modifying
    @Query("UPDATE TimerState t SET t.phase = :phase, t.countdown = :countdown, t.lastActive = :lastActive " +
           "WHERE t.code = :code")
    void updateTimerState(@Param("code") String code,
                         @Param("phase") String phase,
                         @Param("countdown") Integer countdown,
                         @Param("lastActive") Long lastActive);
}