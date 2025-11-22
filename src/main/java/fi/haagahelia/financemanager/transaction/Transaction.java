package fi.haagahelia.financemanager.transaction;

import fi.haagahelia.financemanager.account.Account;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Represents a financial transaction.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;

    private double amount;

    private LocalDate date;

    @Enumerated(EnumType.STRING)
    private TransactionType type;

    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;
}
