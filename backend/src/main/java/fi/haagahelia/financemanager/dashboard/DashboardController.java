package fi.haagahelia.financemanager.dashboard;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @GetMapping
    public Map<String, Object> dashboard() {
        return Map.of(
            "summary", Map.of(
                "totalBalance", 0,
                "income", 0,
                "expenses", 0,
                "savingsRate", 0
            ),
            "recentTransactions", List.of()
        );
    }
}
