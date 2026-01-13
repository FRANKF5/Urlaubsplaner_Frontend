package com.urlaubsplaner.uniprojekt.templates;

public class RegistrationData {
    private Auth authData;
    private PersonalData personalData;

    public RegistrationData() {
    }

    public RegistrationData(Auth authData, PersonalData personalData) {
        this.authData = authData;
        this.personalData = personalData;
    }

    public Auth getAuthData() {
        return authData;
    }

    public void setAuthData(Auth authData) {
        this.authData = authData;
    }

    public PersonalData getPersonalData() {
        return personalData;
    }

    public void setPersonalData(PersonalData personalData) {
        this.personalData = personalData;
    }
}
