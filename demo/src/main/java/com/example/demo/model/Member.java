package com.example.demo.model;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "members")
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(unique = true, nullable = false)
    private String qrToken;

    private LocalDate membershipStart;

    private LocalDate membershipEnd;

    public Member() {
    }

    public Member(String name, String phoneNumber,LocalDate membershipStart, LocalDate membershipEnd) {
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.membershipStart = membershipStart;
        this.membershipEnd = membershipEnd;
        this.qrToken = UUID.randomUUID().toString();
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getQrToken() {
        return qrToken;
    }

    public LocalDate getMembershipStart() {
        return membershipStart;
    }

    public LocalDate getMembershipEnd() {
        return membershipEnd;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public void setMembershipStart(LocalDate membershipStart) {
        this.membershipStart = membershipStart;
    }

    public void setMembershipEnd(LocalDate membershipEnd) {
        this.membershipEnd = membershipEnd;
    }
}