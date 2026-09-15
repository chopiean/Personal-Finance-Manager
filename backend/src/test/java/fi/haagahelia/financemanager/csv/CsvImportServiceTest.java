package fi.haagahelia.financemanager.csv;

import fi.haagahelia.financemanager.transaction.TransactionService;
import fi.haagahelia.financemanager.transaction.dto.TransactionRequest;
import fi.haagahelia.financemanager.transaction.dto.TransactionResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CsvImportServiceTest {

    @Mock
    private TransactionService transactionService;

    @InjectMocks
    private CsvImportService csvImportService;

    @Test
    void importCsv_importsAllValidRows_andSkipsHeader() {
        String csv = "date,description,category,amount,type\n"
                + "2025-01-01,Coffee,Food,4.50,EXPENSE\n"
                + "2025-01-02,Salary,Income,2000.00,INCOME\n";

        MockMultipartFile file = new MockMultipartFile(
                "file", "transactions.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        when(transactionService.createTransactionFromCsv(any(TransactionRequest.class)))
                .thenReturn(TransactionResponse.builder().id(1L).build());

        int count = csvImportService.importCsv(file, 5L);

        assertThat(count).isEqualTo(2);

        ArgumentCaptor<TransactionRequest> captor = ArgumentCaptor.forClass(TransactionRequest.class);
        verify(transactionService, times(2)).createTransactionFromCsv(captor.capture());

        TransactionRequest first = captor.getAllValues().get(0);
        assertThat(first.getDescription()).isEqualTo("Coffee");
        assertThat(first.getCategory()).isEqualTo("Food");
        assertThat(first.getAmount()).isEqualTo(4.50);
        assertThat(first.getDate()).isEqualTo(LocalDate.of(2025, 1, 1));
        assertThat(first.getAccountId()).isEqualTo(5L);
    }

    @Test
    void importCsv_skipsRowsWithTooFewColumns() {
        String csv = "date,description,category,amount,type\n"
                + "2025-01-01,Coffee,Food\n" // malformed - too few columns
                + "2025-01-02,Salary,Income,2000.00,INCOME\n";

        MockMultipartFile file = new MockMultipartFile(
                "file", "transactions.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        when(transactionService.createTransactionFromCsv(any(TransactionRequest.class)))
                .thenReturn(TransactionResponse.builder().id(1L).build());

        int count = csvImportService.importCsv(file, 5L);

        assertThat(count).isEqualTo(1);
        verify(transactionService, times(1)).createTransactionFromCsv(any());
    }

    @Test
    void importCsv_returnsZero_whenOnlyHeaderPresent() {
        String csv = "date,description,category,amount,type\n";

        MockMultipartFile file = new MockMultipartFile(
                "file", "transactions.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        int count = csvImportService.importCsv(file, 5L);

        assertThat(count).isEqualTo(0);
        verifyNoInteractions(transactionService);
    }

    @Test
    void importCsv_throws_whenAmountIsUnparseable() {
        String csv = "date,description,category,amount,type\n"
                + "2025-01-01,Coffee,Food,not-a-number,EXPENSE\n";

        MockMultipartFile file = new MockMultipartFile(
                "file", "transactions.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        assertThatThrownBy(() -> csvImportService.importCsv(file, 5L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Failed to import CSV");
    }

    @Test
    void importCsv_throws_whenTypeIsInvalid() {
        String csv = "date,description,category,amount,type\n"
                + "2025-01-01,Coffee,Food,4.50,NOT_A_TYPE\n";

        MockMultipartFile file = new MockMultipartFile(
                "file", "transactions.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        assertThatThrownBy(() -> csvImportService.importCsv(file, 5L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Failed to import CSV");
    }
}
