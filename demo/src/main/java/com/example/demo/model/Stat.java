package com.example.demo.model;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "stat")
public class Stat { 

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private LocalDate StartTime;

    private int EndTime;

    private int revenu;

    private int NumberOfRenewl;
    
    private int NumberOfNewClient;



    


    
    public LocalDate getStartTime() {
        return StartTime;
    }

    public void setStartTime(LocalDate startTime) {
        StartTime = startTime;
    }

    public int getEndTime() {
        return EndTime;
    }

    public void setEndTime(int endTime) {
        EndTime = endTime;
    }

    public int getRevenu() {
        return revenu;
    }

    public void setRevenu(int revenu) {
        this.revenu = revenu;
    }

    public int getNumberOfRenewl() {
        return NumberOfRenewl;
    }

    public void setNumberOfRenewl(int numberOfRenewl) {
        NumberOfRenewl = numberOfRenewl;
    }

    public int getNumberOfNewClient() {
        return NumberOfNewClient;
    }

    public void setNumberOfNewClient(int numberOfNewClient) {
        NumberOfNewClient = numberOfNewClient;
    }
}