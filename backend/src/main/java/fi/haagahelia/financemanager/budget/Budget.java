package fi.haagahelia.financemanager.budget;

import fi.haagahelia.financemanager.account.Account;
import fi.haagahelia.financemanager.user.User;
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

    @Column(name = "budget_month")
    private int month;

    @Column(name = "budget_year")
    private int year;

    @ManyToOne(optional = false)
    @JoinColumn(name = "account_id")
    private Account account;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;   
}
