package com.urlaubsplaner.uniprojekt.templates;

public class User {
    private String email;
    private PersonalData personalData;

    public User(String email, PersonalData personalData) {
        this.email = email;
        this.personalData = personalData;
    }

    //Getter and Setters
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public PersonalData getPersonalData() {
        return personalData;
    }
    public void setPersonalData(PersonalData personalData) {
        this.personalData = personalData;
    }
}
