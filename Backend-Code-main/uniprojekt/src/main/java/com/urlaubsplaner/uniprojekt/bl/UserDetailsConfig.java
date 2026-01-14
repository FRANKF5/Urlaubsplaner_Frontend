package com.urlaubsplaner.uniprojekt.bl;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.UserDetailsService;

@Configuration
public class UserDetailsConfig {

    @Bean
    UserDetailsService userDetailsService() {
        // Kein Default-User mehr, kein generiertes Passwort
        return username -> {
            throw new UnsupportedOperationException("UserDetailsService not used (JWT only)");
        };
    }
}
