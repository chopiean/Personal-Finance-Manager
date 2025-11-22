package fi.haagahelia.financemanager.transaction;

import fi.haagahelia.financemanager.account.Account;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Represents a financial transaction belonging to an Account.
 *
 * Uses Lombok annotations for:
 * - @Getter / @Setter   → auto-generate getters & setters
 * - @Builder            → allow Transaction.builder()
 * - @NoArgsConstructor  → empty constructor for JPA
 * - @AllArgsConstructor → full constructor
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

    /** Short title like "Rent", "Groceries", "Salary". */
    private String description;

    /** Transaction amount (must be positive). */
    private double amount;

    /** Date of the transaction. */
    private LocalDate date;

    /** INCOME, EXPENSE, TRANSFER. */
    @Enumerated(EnumType.STRING)
    private TransactionType type;

    /** The account this transaction belongs to. */
    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;
}
