package com.urlaubsplaner.uniprojekt.bl;

import org.springframework.stereotype.Service;

import com.urlaubsplaner.uniprojekt.database.*;
import com.urlaubsplaner.uniprojekt.templates.User;

@Service
public class UserService {

    private final AuthConnector authConnector;

    public UserService(AuthConnector authConnector) {
        this.authConnector = authConnector;
    }

    public User getUserInfo(long authId) {
        if(authId <= 0){
            return null;
        }
        String mail = authConnector.mailById(authId);
        if(mail == null || mail.isEmpty()){
            return null;
        }
        User user = new User(mail, authConnector.getPersonalDataByAuthId(authId));
        return user;
    }

    public boolean logoutAll(long authId) {
        if(authId <= 0){
            return false;
        }
        // Delete all refresh tokens for this user
        authConnector.deleteRefreshTokensByUserId(authId);
        return true;
    }
}
