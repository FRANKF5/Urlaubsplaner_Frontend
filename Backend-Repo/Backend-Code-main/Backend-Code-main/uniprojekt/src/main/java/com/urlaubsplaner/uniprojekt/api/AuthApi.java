package com.urlaubsplaner.uniprojekt.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.urlaubsplaner.uniprojekt.bl.Authentification;
import com.urlaubsplaner.uniprojekt.templates.*;

@RestController
@RequestMapping("/auth")
public class AuthApi {

    @Autowired
    private Authentification authentification;

    @PostMapping("/login")
    public ResponseEntity<Token> login(@RequestBody Auth authData) {
        try {
            Token token = authentification.login(authData.getMail(), authData.getPassword());
            if (token != null) {
                return ResponseEntity.ok(token);
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<Token> refresh(@RequestBody RefreshToken refreshToken) {
        try {
            Token newToken = authentification.refresh(refreshToken.getRefreshToken());
            if (newToken != null) {
                return ResponseEntity.ok(newToken);
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/register")
    public ResponseEntity<Boolean> register(@RequestBody RegistrationData registrationRequest) {
        try {
            boolean verification = authentification.register(
                registrationRequest.getPersonalData(),
                registrationRequest.getAuthData().getMail(),
                registrationRequest.getAuthData().getPassword()
            );
            if (verification) {
                return ResponseEntity.status(HttpStatus.CREATED).body(verification);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<Boolean> verify(@RequestBody Verification verificationCode) {
        try {
            boolean verified = authentification.verify(verificationCode);
            if (verified) {
                return ResponseEntity.ok(true);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(false);
        }
    }


    //Implemented in UserApi
    // @PostMapping("/logout")
    // public ResponseEntity<Boolean> logout(@RequestBody RefreshToken refreshToken) {
    //     try {
    //         boolean loggedOut = authentification.logout(refreshToken.getRefreshToken());
    //         if (loggedOut) {
    //             return ResponseEntity.ok(true);
    //         }
    //         return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
    //     } catch (Exception e) {
    //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(false);
    //     }
    // }
}
