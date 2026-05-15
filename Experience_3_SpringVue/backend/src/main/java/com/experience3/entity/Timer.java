package com.experience3.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "timers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Timer {

    @Id
    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String phase;

    @Column(nullable = false)
    private Integer countdown;

    @Column(nullable = false)
    private Long lastActive;
}
