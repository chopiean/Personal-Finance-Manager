package fi.haagahelia.financemanager.account;

import fi.haagahelia.financemanager.account.dto.AccountRequest;
import fi.haagahelia.financemanager.account.dto.AccountResponse;
import fi.haagahelia.financemanager.user.User;
import fi.haagahelia.financemanager.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Business logic for Account operations.
 */
@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    /**
     * Create a new account for the given username.
     */
    @Transactional
    public AccountResponse createAccount(AccountRequest req, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found: " + username));

        Account account = Account.builder()
                .name(req.getName())
                .currency(req.getCurrency())
                .initialBalance(req.getInitialBalance())
                .type(req.getType())
                .description(req.getDescription())
                .archived(false)
                .createdAt(LocalDate.now())
                .user(user)
                .build();

        Account saved = accountRepository.save(account);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> getAccountsForUserOrAll(String usernameOrNull) {
        if (usernameOrNull == null || "anonymousUser".equals(usernameOrNull)) {
            return accountRepository.findAll()
                    .stream()
                    .map(this::toResponse)
                    .toList();
        }

        User user = userRepository.findByUsername(usernameOrNull)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found: " + usernameOrNull));

        return accountRepository.findByUser(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Convert Account entity → DTO.
     */
    private AccountResponse toResponse(Account account) {
        return AccountResponse.builder()
                .id(account.getId())
                .name(account.getName())
                .currency(account.getCurrency())
                .initialBalance(account.getInitialBalance())
                .type(account.getType())
                .description(account.getDescription())
                .archived(account.isArchived())
                .createdAt(account.getCreatedAt())
                .userId(account.getUser().getId())
                .build();
    }
}
