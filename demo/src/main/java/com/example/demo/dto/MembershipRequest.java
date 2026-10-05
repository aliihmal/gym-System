package com.example.demo.dto;

public class MembershipRequest {

    private int numberOfMonths;
    private String phoneNumber;

    public MembershipRequest() {
    }

    public MembershipRequest(int numberOfMonths,  String phoneNumber) {
        this.numberOfMonths = numberOfMonths;
        this.phoneNumber = phoneNumber;
    }

    public int getNumberOfMonths() {
        return numberOfMonths;
    }

    public void setNumberOfMonths(int numberOfMonths) {
        this.numberOfMonths = numberOfMonths;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setUserId(String phonenumber) {
        this.phoneNumber=phonenumber;
    }
}