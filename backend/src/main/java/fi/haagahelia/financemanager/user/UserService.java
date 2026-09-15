package fi.haagahelia.financemanager.user;

import fi.haagahelia.financemanager.account.AccountRepository;
import fi.haagahelia.financemanager.budget.BudgetRepository;
import fi.haagahelia.financemanager.transaction.TransactionRepository;
import fi.haagahelia.financemanager.user.dto.UserRegisterRequest;
import fi.haagahelia.financemanager.user.dto.UserResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final AccountRepository accountRepository;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       TransactionRepository transactionRepository,
                       BudgetRepository budgetRepository,
                       AccountRepository accountRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
        this.accountRepository = accountRepository;
    }

    // ----------------------
    // REGISTER NEW USER
    // ----------------------
    @Transactional
    public UserResponse register(UserRegisterRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("This username is already taken.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("This email is already registered.");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail()); // 👈 NEW
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("ROLE_USER");

        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    // ----------------------
    // DELETE OWN ACCOUNT
    // ----------------------
    @Transactional
    public void deleteAccount(Long userId) {
        transactionRepository.deleteByAccountUserId(userId);
        budgetRepository.deleteByAccountUserId(userId);
        accountRepository.deleteByUserId(userId);
        userRepository.deleteById(userId);
    }

    // ----------------------
    // GET USER BY ID
    // ----------------------
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ----------------------
    // MAP ENTITY → DTO
    // ----------------------
    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),   
                user.getRole()
        );
    }
}
