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

        // Load authenticated user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found: " + username));

        // FIX #1 — Give default account type if missing
        AccountType type = (req.getType() != null)
                ? req.getType()
                : AccountType.BANK;   // <- DEFAULT VALUE

        // FIX #2 — Always set createdAt
        LocalDate created = LocalDate.now();

        Account account = Account.builder()
                .name(req.getName())
                .currency(req.getCurrency())
                .initialBalance(req.getInitialBalance())
                .type(type)                    // FIXED (never null)
                .description(req.getDescription())
                .archived(false)
                .createdAt(created)            // FIXED (always set)
                .user(user)
                .build();

        Account saved = accountRepository.save(account);
        return toResponse(saved);
    }

    /**
     * Get all accounts for this user.
     */
    @Transactional(readOnly = true)
    public List<AccountResponse> getAccountsForUserOrAll(String username) {

        // No more anonymous user when using JWT — always authenticated
        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found: " + username));

        return accountRepository.findByUser(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Convert Account entity → DTO.
     */
    private AccountResponse toResponse(Account acc) {
        return AccountResponse.builder()
                .id(acc.getId())
                .name(acc.getName())
                .currency(acc.getCurrency())
                .initialBalance(acc.getInitialBalance())
                .type(acc.getType())
                .description(acc.getDescription())
                .archived(acc.isArchived())
                .createdAt(acc.getCreatedAt())
                .userId(acc.getUser().getId())
                .build();
    }
}
