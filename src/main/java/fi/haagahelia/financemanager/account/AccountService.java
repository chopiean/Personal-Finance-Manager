package fi.haagahelia.financemanager.account;

import fi.haagahelia.financemanager.security.CurrentUserService;
import fi.haagahelia.financemanager.user.User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Business logic related to accounts.
 */
@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final CurrentUserService currentUserService;

    public AccountService(AccountRepository accountRepository,
                          CurrentUserService currentUserService) {
        this.accountRepository = accountRepository;
        this.currentUserService = currentUserService;
    }

    /**
     * Returns all accounts of the currently logged-in user.
     */
    public List<AccountDto> getMyAccounts() {
        User user = currentUserService.getCurrentUser();

        return accountRepository.findByUser(user).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Creates a new account for the current user.
     */
    public AccountDto createAccount(AccountDto dto) {
        User user = currentUserService.getCurrentUser();

        Account account = new Account();
        account.setName(dto.getName());
        account.setType(dto.getType());
        account.setCurrency(dto.getCurrency());
        account.setInitialBalance(
                dto.getInitialBalance() != null ? dto.getInitialBalance() : dto.getInitialBalance()
        );
        account.setUser(user);

        Account saved = accountRepository.save(account);
        return toDto(saved);
    }

    private AccountDto toDto(Account account) {
        return new AccountDto(
                account.getId(),
                account.getName(),
                account.getType(),
                account.getCurrency(),
                account.getInitialBalance()
        );
    }
}
