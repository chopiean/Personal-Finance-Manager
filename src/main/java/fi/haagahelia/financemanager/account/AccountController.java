package fi.haagahelia.financemanager.account;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API for managing accounts of the logged-in user.
 */
@RestController
@RequestMapping("/api/accounts")
public class AccountController {
    
    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    /**
     * GET /api/accounts
     *
     * Returns all accounts belonging to the current user.
     */
    @GetMapping
    public List<AccountDto> getMyAccounts() {
        return accountService.getMyAccounts();
    }

    /**
     * POST /api/accounts
     *
     * Creates a new account for the current user.
     */
    @PostMapping
    public ResponseEntity<AccountDto> createAccount(@RequestBody AccountDto dto) {
        AccountDto created = accountService.createAccount(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
 }
