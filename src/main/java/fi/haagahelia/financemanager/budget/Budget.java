package fi.haagahelia.financemanager.budget;

import fi.haagahelia.financemanager.account.Account;
import jakarta.persistence.*;
import lombok.*;

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

    private int month;

    private int year;

    @ManyToOne
    @JoinColumn(name = "account_id")
    private Account account;
}
