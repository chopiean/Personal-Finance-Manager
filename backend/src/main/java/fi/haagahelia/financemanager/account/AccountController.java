package fi.haagahelia.financemanager.account;

import fi.haagahelia.financemanager.account.dto.AccountRequest;
import fi.haagahelia.financemanager.account.dto.AccountResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;

/**
 * REST API for managing accounts.
 */
@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AccountController {

    private final AccountService accountService;

    /**
     * Create a new account for the logged-in user.
     */
    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(
            @Valid @RequestBody AccountRequest request,
            @AuthenticationPrincipal UserDetails principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        AccountResponse created =
                accountService.createAccount(request, principal.getUsername());

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Get accounts.
     */
    @GetMapping
    public List<AccountResponse> getAccounts(
            @AuthenticationPrincipal UserDetails principal
    ) {
        String username = (principal != null ? principal.getUsername() : null);
        return accountService.getAccountsForUserOrAll(username)
                            .stream()
                            .sorted(Comparator.comparing(AccountResponse::getName))
                            .toList();
    }
}
