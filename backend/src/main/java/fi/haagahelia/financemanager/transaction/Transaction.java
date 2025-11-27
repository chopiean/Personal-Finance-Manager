package fi.haagahelia.financemanager.transaction;

import fi.haagahelia.financemanager.account.Account;
import fi.haagahelia.financemanager.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

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

    @Column(nullable = true, length = 80)
    private String category;

    @ManyToOne(optional = false)
    @JoinColumn(name = "account_id")
    private Account account;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;   
}
