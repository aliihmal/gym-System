package com.example.demo.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.model.Member;

public interface MemberRepository
        extends JpaRepository<Member, UUID> {

    Optional<Member> findByQrToken(String qrToken);

    Optional<Member> findByPhoneNumber(String phoneNumber);

    @Query("SELECT m FROM Member m WHERE m.membershipEnd < :today")
    List<Member> findExpired(@Param("today") LocalDate today);


    
    @Query("SELECT m FROM Member m WHERE m.membershipEnd >= :today")
    List<Member> findActive(@Param("today") LocalDate today);
    


    List<Member> findByMembershipEndBetweenOrderByMembershipEndAsc(LocalDate from, LocalDate to);
}