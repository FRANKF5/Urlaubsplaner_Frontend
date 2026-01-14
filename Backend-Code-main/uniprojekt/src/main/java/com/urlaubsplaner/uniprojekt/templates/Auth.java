package com.urlaubsplaner.uniprojekt.templates;

import java.sql.Timestamp;

public class Auth {
    private long id;
    private String mail;
    private String password;
    private String pass_hash;
    private Timestamp confirmed_at;

    public Auth(String mail,String pass_hash) {
        this.mail = mail;
        this.pass_hash = pass_hash;
    }

    public long getId() {
        return id;
    }
    public void setId(long id) {
        this.id = id;
    }
    public String getMail() {
        return mail;
    }
    public void setMail(String mail) {
        this.mail = mail;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public String getPass_hash() {
        return pass_hash;
    }
    public void setPass_hash(String pass_hash) {
        this.pass_hash = pass_hash;
    }
    public Timestamp getConfirmed_at() {
        return confirmed_at;
    }
    public void setConfirmed_at(Timestamp confirmed_at) {
        this.confirmed_at = confirmed_at;
    }
}
