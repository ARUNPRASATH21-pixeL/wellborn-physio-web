package com.Website.wellborn.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "doctor")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctors {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long doctorId;

    private String doctorName;

    private String qualification;

    private String specialization;

    private String experience;

    private String phone;

    private String email;

    @Column(length = 1000)
    private String image;

    private Boolean status;
}