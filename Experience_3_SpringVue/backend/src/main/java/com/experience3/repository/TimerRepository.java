package com.experience3.repository;

import com.experience3.entity.Timer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TimerRepository extends JpaRepository<Timer, String> {
    Optional<Timer> findByCode(String code);
}
