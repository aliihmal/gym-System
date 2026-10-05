package com.example.demo.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.demo.model.Member;
import com.example.demo.repository.MemberRepository;
@Service
public  class MemberService{
        private MemberRepository MemRepo;

   

    public MemberService(MemberRepository MemRepo) {
        this.MemRepo = MemRepo;
    }

    public Optional<Member> getMemberById(UUID id){
        return this.MemRepo.findById(id) ;
    }

    public List<Member> getAllMembers(){
        return this.MemRepo.findAll();
    }
    public Member createMember(Member mem){
        return this.MemRepo.save(mem);
    }

    public void renewDates(int month,String phoneNumber) {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusDays(month * 30);
        Optional<Member> optionalMember = this.MemRepo.findByPhoneNumber(phoneNumber);


        if (optionalMember.isPresent()) {
            Member mem = optionalMember.get();

            mem.setMembershipStart(startDate);
            mem.setMembershipEnd(endDate);

            this.MemRepo.save(mem);
        }

    }
    public List<Member> findExpiredMembership(){
        return this.MemRepo.findExpired(LocalDate.now());
    }
    public Optional<Member>  findByphoneNumber(String phoneNumber){
        return this.MemRepo.findByPhoneNumber(phoneNumber);
    }

    public int totalNumberOfMembers(){
        List<Member> AllTheMembers = this.MemRepo.findAll();
        return AllTheMembers.size();
    }

    public List<Member> getAllActiveMembers(){
        return this.MemRepo.findActive(LocalDate.now());
    }
    
    public int getAllActiveMembersNumber(){
        return this.MemRepo.findActive(LocalDate.now()).size();
    }

    public List<Member> getExpiringSoon(int days) {
        LocalDate today = LocalDate.now();
        return MemRepo.findByMembershipEndBetweenOrderByMembershipEndAsc(today, today.plusDays(days));
    }
}