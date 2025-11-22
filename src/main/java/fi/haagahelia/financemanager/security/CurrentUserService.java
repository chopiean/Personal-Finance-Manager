package fi.haagahelia.financemanager.security;

import fi.haagahelia.financemanager.user.User;
import fi.haagahelia.financemanager.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * Small helper for accessing the current authenticated User entity.
 */
@Service
public class CurrentUserService {
    
    private final UserRepository userRepository;
    
    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Returns the currently authenticated user, or throws IllegalStateException
     * if no user is logged in.
     */
    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalStateException("No authenticated user in security context");
        }

        String username = auth.getName();
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalStateException("User not found: " + username));
    }
}
