package com.example.demo.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Stat;

public interface StatRepository extends JpaRepository<Stat,UUID>{
    
}