package com.experience3.repository;

import com.experience3.entity.UserGameData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserGameDataRepository extends JpaRepository<UserGameData, Long> {

    Optional<UserGameData> findByUidAndSessionNumber(Long uid, Integer sessionNumber);

    List<UserGameData> findByUid(Long uid);
}