package com.urlaubsplaner.uniprojekt.api;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.urlaubsplaner.uniprojekt.bl.Authentification;
import com.urlaubsplaner.uniprojekt.bl.BadRequestException;
import com.urlaubsplaner.uniprojekt.bl.UserService;
import com.urlaubsplaner.uniprojekt.templates.*;

@RestController
@RequestMapping("/api/user")
public class UserApi {

    private final UserService userService;
    private final Authentification authentification;

    public UserApi(UserService userService, Authentification authentification) {
        this.userService = userService;
        this.authentification = authentification;
    }

    @GetMapping("/info")
    public ResponseEntity<User> getUserInfo(@AuthenticationPrincipal long authId) throws BadRequestException {
        User user = userService.getUserInfo(authId);
        if(user == null){
            throw new BadRequestException("User not found");
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<Boolean> logout(@RequestBody Token token, @AuthenticationPrincipal long authId) throws BadRequestException {
        // Implement logout logic here
        if(!authentification.logout(token.getRefreshToken(), authId)){
            throw new BadRequestException("Logout failed");
        }
        return ResponseEntity.ok(true);
    }

    @PostMapping("/logoutAll")
    public ResponseEntity<Boolean> logoutAll(@AuthenticationPrincipal long authId) throws BadRequestException {
        // Implement logout all logic here
        if(!userService.logoutAll(authId)){
            throw new BadRequestException("Logout all failed");
        }
        return ResponseEntity.ok(true);
    }

    @PatchMapping("/info")
    public ResponseEntity<Boolean> updateUserInfo(@RequestBody PersonalData personalData, @AuthenticationPrincipal long authId) throws BadRequestException {
        // Implement update user info logic here
        if(!authentification.updatePersonalData(authId, personalData)){
            throw new BadRequestException("Update failed");
        }
        return ResponseEntity.ok(true);
    }
}
