package fi.haagahelia.financemanager.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * TEMPORARY TESTING CONFIG:
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())           
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()        
                )
                .headers(headers -> headers
                        .frameOptions(frame -> frame.disable())   
                );

        return http.build();
    }
}
