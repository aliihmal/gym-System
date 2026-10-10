package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;

import com.example.demo.model.Stat;
import com.example.demo.service.StatService;

@RestController
@RequestMapping("stat")
public class StatController{
    private StatService statSer;

    public StatController(StatService statSer) {
        this.statSer = statSer;
    }

    @GetMapping("/getMonthlyRev")
    public int getMonthlyRev(){
        Stat stat = this.statSer.getThestat();
        return stat.getRevenu();
    } 
    
    @GetMapping("/NbOfRenewl")
    public int getNubRenewl(){
        Stat stat = this.statSer.getThestat();
        return stat.getNumberOfRenewl();
    }
    @GetMapping("/NbOfNewClient")
    public int getNbNewClient(){
        Stat stat = this.statSer.getThestat();
        return stat.getNumberOfNewClient();
    }
    @PostMapping("/")
    public Stat createStat(){
        return this.statSer.createStat();
    }
}