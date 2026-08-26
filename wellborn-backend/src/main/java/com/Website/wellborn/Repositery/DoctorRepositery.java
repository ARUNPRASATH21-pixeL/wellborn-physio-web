package com.Website.wellborn.Repositery;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Website.wellborn.Entity.Doctors;

public interface DoctorRepositery extends JpaRepository<Doctors, Long> {

}