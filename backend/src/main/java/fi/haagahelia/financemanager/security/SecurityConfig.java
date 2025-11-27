package fi.haagahelia.financemanager.security;

import fi.haagahelia.financemanager.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;

import org.springframework.http.HttpMethod;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserRepository userRepository;

    // -------------------------------
    // BEANS
    // -------------------------------

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return identifier ->
                userRepository.findByUsernameOrEmail(identifier, identifier)
                        .map(user -> org.springframework.security.core.userdetails.User
                                .withUsername(user.getUsername())
                                .password(user.getPassword())
                                .roles(user.getRole().replace("ROLE_", ""))
                                .build()
                        )
                        .orElseThrow(() ->
                                new UsernameNotFoundException("User not found: " + identifier));
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(
            UserDetailsService uds,
            PasswordEncoder encoder
    ) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(uds);
        provider.setPasswordEncoder(encoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    // -------------------------------
    // SECURITY FILTER CHAIN
    // -------------------------------

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           DaoAuthenticationProvider provider,
                                           JwtAuthenticationFilter jwtFilter) throws Exception {

        http.csrf(csrf -> csrf.disable())
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                .authenticationProvider(provider)
                .securityContext(sc -> sc.requireExplicitSave(false))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Enable CORS using our custom configuration
                .cors(cors -> cors.configurationSource(req -> configureCors()));

        http.authorizeHttpRequests(auth -> auth
                // IMPORTANT: allow preflight CORS requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                .requestMatchers(
                        "/api/auth/login",
                        "/api/auth/register",
                        "/h2-console/**"
                ).permitAll()

                .anyRequest().authenticated()
        );

        // Add JWT filter BEFORE username/password filter
        http.addFilterBefore(jwtFilter,
                org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class
        );

        return http.build();
    }

    // -------------------------------
    // CORS CONFIG (FULLY FIXED)
    // -------------------------------

    private CorsConfiguration configureCors() {
        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowCredentials(true);

        // Use PATTERNS instead of direct origins (fixes Vercel CORS)
        cors.setAllowedOriginPatterns(List.of(
                "http://localhost:5173",
                "https://*.vercel.app",
                "https://personal-finance-manager-teal.vercel.app"
        ));

        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(List.of("*"));
        cors.setExposedHeaders(List.of("Authorization"));

        return cors;
    }
}
