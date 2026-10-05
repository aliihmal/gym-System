package com.example.demo.controller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.MembershipRequest;
import com.example.demo.model.Member;
import com.example.demo.service.MemberService;

@RestController
@RequestMapping("/member")
public class MemberController{
    private MemberService MemSer;

 

    public MemberController(MemberService MemSer) {
        this.MemSer = MemSer;
    }

    @GetMapping("/getById/{id}")
    public Optional<Member> getMemberById(@PathVariable UUID id){
        return this.MemSer.getMemberById(id);
    } 
    @GetMapping("/getAll")
    public List<Member> getAllMembers(){
        return this.MemSer.getAllMembers();
    }   
    @PostMapping("/")
    public Member createMember(@RequestBody Member memeber){
        return this.MemSer.createMember(memeber);
    }
    @PostMapping("/renewMembership/")
    public void renewMembership (@RequestBody MembershipRequest MemReq){
        this.MemSer.renewDates(MemReq.getNumberOfMonths(), MemReq.getPhoneNumber());

    }
    @GetMapping("/ExpiredMembers")
    public List<Member> getExpiredMember(){
        return this.MemSer.findExpiredMembership();
    }
    @GetMapping("/MembersNumber")
    public int getMembersNumber(){
        return this.MemSer.totalNumberOfMembers();
    }
    
    @GetMapping("/ActiveMember")
    public List<Member> getAllActiveMember(){
        return this.MemSer.getAllActiveMembers();
    }
    
     @GetMapping("/ActiveMemberNumber")
     public int getActiveMemberNumber(){
        return this.MemSer.getAllActiveMembersNumber();
     }    

     @GetMapping("/ExpiringSoon")
    public List<Member> getExpiringSoon(@RequestParam(defaultValue = "7") int days) {
        return this.MemSer.getExpiringSoon(days);
    }
    
}