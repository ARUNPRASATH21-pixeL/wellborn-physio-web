package com.Website.wellborn.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "service")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhysioService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long serviceId;

    private String serviceName;

    @Column(length = 1000)
    private String description;

    // DB-ல் image path மட்டும் save ஆகும்
    private String image;

    private Boolean status;
}