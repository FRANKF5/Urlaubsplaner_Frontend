package com.urlaubsplaner.uniprojekt.bl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.urlaubsplaner.uniprojekt.database.UserConnector;
import com.urlaubsplaner.uniprojekt.templates.UserConfig;

@Service
public class UserSettingService {
    
    private final UserConnector userConnector;

    public UserSettingService(UserConnector userConnector) {
        this.userConnector = userConnector;
    }  

    public UserConfig getUserSetting(long authId, String option) {
        if(authId <= 0 || option == null || option.isEmpty()){
            return null;
        }
        return userConnector.getUserSetting(authId, option);
    }

    public List<UserConfig> getUserSettings(long authId) {
        if(authId <= 0){
            return null;
        }
        return userConnector.getUserSettings(authId);
    }

    public boolean upsertUserSetting(long authId, String option, String value) {
        if(authId <= 0 || option == null || option.isEmpty() || value == null){
            return false;
        }
        UserConfig newSetting = new UserConfig(authId, option, value);
        return userConnector.upsertUserSetting(newSetting);
    }
}
