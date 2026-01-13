package com.urlaubsplaner.uniprojekt.templates;

import java.sql.Date;

public class PersonalData {
    //Attributes
    private long userId;
    private long authId; // FK to Auth
    private String firstName;
    private String lastName;
    private String gender;
    private String avatarUrl;
    private String userName;
    private Date birthDate;

    
    //Getter and Setters
    public long getAuthId() {
        return authId;
    }
    public void setAuthId(long authId) {
        this.authId = authId;
    }
    public long getUserId() {
        return userId;
    }
    public void setUserId(long userId) {
        this.userId = userId;
    }
    public String getFirstName() {
        return firstName;
    }
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    public String getLastName() {
        return lastName;
    }
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    public String getGender() {
        return gender;
    }
    public void setGender(String gender) {
        this.gender = gender;
    }
    public String getAvatarUrl() {
        return avatarUrl;
    }
    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
    public String getUserName() {
        return userName;
    }
    public void setUserName(String userName) {
        this.userName = userName;
    }
    public Date getBirthDate() {
        return birthDate;
    }
    public void setBirthDate(Date birthDate) {
        this.birthDate = birthDate;
    }
}
