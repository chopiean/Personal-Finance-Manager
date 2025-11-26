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

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    @Transactional
    public AccountResponse createAccount(AccountRequest req, String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found: " + username));

        AccountType type = (req.getType() != null)
                ? req.getType()
                : AccountType.BANK;

        Account account = Account.builder()
                .name(req.getName())
                .currency(req.getCurrency())
                .initialBalance(req.getInitialBalance())
                .type(type)
                .description(req.getDescription())
                .archived(false)
                .createdAt(LocalDate.now())
                .user(user)
                .build();

        return toResponse(accountRepository.save(account));
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> getAccountsForUser(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found: " + username));

        return accountRepository.findByUser(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

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
