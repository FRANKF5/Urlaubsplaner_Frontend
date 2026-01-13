package com.urlaubsplaner.uniprojekt.bl;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.sql.Timestamp;

import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import com.urlaubsplaner.uniprojekt.database.AuthConnector;
import com.urlaubsplaner.uniprojekt.templates.*;

import com.urlaubsplaner.uniprojekt.mail.*;

@Service
public class Authentification {

    private final AuthConnector authConnector;
    private final JwtUtil jwtUtil;
    private final Mailer mailer;

    public Authentification(AuthConnector authConnector, JwtUtil jwtUtil, Mailer mailer) {
        this.authConnector =  authConnector;
        this.jwtUtil = jwtUtil;
        this.mailer = mailer;
    }

    private final SecureRandom RANDOM = new SecureRandom();
    private final String ALPHANUM = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    private final int VERIFICATION_CODE_LENGTH = 8;

    public Token login(String email, String password) {
        if (email == null || password == null) {
            return null;
        }

        Auth auth = authConnector.authByMail(email);
        if (auth == null) {
            return null;
        }

        if (auth.getConfirmed_at() == null || auth.getConfirmed_at().after(new java.util.Date())) {
            return null;
        }

        if (!checkPassword(password, auth.getPass_hash())) {
            return null;
        }

        String refreshToken = generateRefreshToken();
        RefreshToken refreshTokenObj = new RefreshToken(refreshToken, auth.getId());
        refreshTokenObj.setExpireDate(Timestamp.from(Instant.now().plus(30, ChronoUnit.DAYS)));
        authConnector.storeRefreshToken(refreshTokenObj); 
        

        Token token = new Token(refreshToken, jwtUtil.createAccessToken(auth.getId()));

        authConnector.storeVerificationDate(auth.getId());
        
        return token; // return Token if login was successful
    }

    public boolean register(PersonalData personalData, String email, String password) { //store personal data, auth data and send verification code
        if (personalData == null || email == null || password == null) {
            return false;
        }

        if (authConnector.authByMail(email) != null) {
            return false; // email already registered
        }

        String hashedPassword = hashPassword(password);
        Auth auth = new Auth(email, hashedPassword);
        
        String verificationCodeStr = generateVerificationCode();
        long authId = authConnector.storeAuth(auth, verificationCodeStr);
        authConnector.storeVerificationCode(authId, verificationCodeStr); 

        personalData.setAuthId(authId);
        authConnector.storePersonalData(personalData);

        mailer.sendVerificationMail(email, verificationCodeStr);

        return true; // return true if registration was successful
    }

    public boolean verify(Verification verificationCode) {
        if (verificationCode == null) {
            return false;
        }

        Verification storedVerification = authConnector.getVerificationByMail(verificationCode.getEmail());
        if (verifyVerificationCode(verificationCode.getVerificationCode(), storedVerification.getVerificationCode())) { 
            return false;
        }

        authConnector.storeVerificationDate(authConnector.authByMail(storedVerification.getEmail()).getId());
        
        return true; // return true if verification was successful
    }

    public boolean logout(String refreshToken, long authId) { 
        if (refreshToken == null) {
            return false;
        }

        if(authConnector.refreshTokenByToken(refreshToken).getAuthId() != authId) {
            return false;
        }

        authConnector.deleteRefreshToken(refreshToken);
        return true; // return true if logout was successful
    }

    public Token refresh(String refreshToken) {
        if (refreshToken == null || isRefreshTokenExpired(refreshToken)) {
            return null;
        }

        authConnector.deleteRefreshToken(refreshToken);

        String refreshToken2 = generateRefreshToken();
        RefreshToken newRefreshToken = new RefreshToken(refreshToken2, authConnector.refreshTokenByToken(refreshToken).getAuthId());
        newRefreshToken.setExpireDate(Timestamp.from(Instant.now().plus(30, ChronoUnit.DAYS)));
        authConnector.storeRefreshToken(newRefreshToken);

        Token newToken = new Token(refreshToken2, jwtUtil.createAccessToken(authConnector.refreshTokenByToken(refreshToken).getAuthId()));
        
        return newToken; // return new Token if refresh was successful
    }

    public boolean updatePersonalData(long authId, PersonalData personalData) {
        if (authId <= 0 || personalData == null) {
            return false;
        }
        // Update personal data in the database
        authConnector.updatePersonalData(authId, personalData);
        return true; // return true if update was successful
    }

    // Additional helper methods

    public String generateVerificationCode() {
        StringBuilder code = new StringBuilder(VERIFICATION_CODE_LENGTH);
        for (int i = 0; i < VERIFICATION_CODE_LENGTH; i++) {
            int index = RANDOM.nextInt(ALPHANUM.length());
            code.append(ALPHANUM.charAt(index));
        }
        return code.toString();
    }

    public boolean checkPassword(String password, String hashedPassword) {
        return BCrypt.checkpw(password, hashedPassword);
    }

    public boolean isRefreshTokenExpired(String refreshToken) {
        RefreshToken refreshToken2 = authConnector.refreshTokenByToken(refreshToken);
        if (refreshToken2 == null || refreshToken2.getExpireDate().before(new java.util.Date())) {
            return true;
        }
        return false; // return true if token is expired
    }

    public boolean verifyVerificationCode(String inputCode, String actualCode) {
        return inputCode.equals(actualCode);
    }

    public String hashPassword(String password) {
        String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());
        return hashedPassword;
    }

    public String generateRefreshToken() {
        String uuid = java.util.UUID.randomUUID().toString();
        return uuid;
    }
}