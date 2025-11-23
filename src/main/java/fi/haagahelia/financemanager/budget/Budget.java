package fi.haagahelia.financemanager.budget;

import fi.haagahelia.financemanager.account.Account;
import jakarta.persistence.*;
import lombok.*;

/**
 * Budget entity stored in the database.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String category;

    private Double limitAmount;

    @Column(name = "budget_month", nullable = false)
    private int month;

    @Column(nullable = false)
    private int year;

    @ManyToOne
    @JoinColumn(name = "account_id")
    private Account account;
}
