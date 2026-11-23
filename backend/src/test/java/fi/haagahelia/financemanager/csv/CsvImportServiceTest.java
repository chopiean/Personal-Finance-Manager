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
import static org.mockito.ArgumentMatchers.eq;
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

        when(transactionService.createTransactionFromCsv(any(TransactionRequest.class), eq("jdoe")))
                .thenReturn(TransactionResponse.builder().id(1L).build());

        int count = csvImportService.importCsv(file, 5L, "jdoe");

        assertThat(count).isEqualTo(2);

        ArgumentCaptor<TransactionRequest> captor = ArgumentCaptor.forClass(TransactionRequest.class);
        verify(transactionService, times(2)).createTransactionFromCsv(captor.capture(), eq("jdoe"));

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

        when(transactionService.createTransactionFromCsv(any(TransactionRequest.class), eq("jdoe")))
                .thenReturn(TransactionResponse.builder().id(1L).build());

        int count = csvImportService.importCsv(file, 5L, "jdoe");

        assertThat(count).isEqualTo(1);
        verify(transactionService, times(1)).createTransactionFromCsv(any(), eq("jdoe"));
    }

    @Test
    void importCsv_returnsZero_whenOnlyHeaderPresent() {
        String csv = "date,description,category,amount,type\n";

        MockMultipartFile file = new MockMultipartFile(
                "file", "transactions.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        int count = csvImportService.importCsv(file, 5L, "jdoe");

        assertThat(count).isEqualTo(0);
        verifyNoInteractions(transactionService);
    }

    @Test
    void importCsv_throws_whenAmountIsUnparseable() {
        String csv = "date,description,category,amount,type\n"
                + "2025-01-01,Coffee,Food,not-a-number,EXPENSE\n";

        MockMultipartFile file = new MockMultipartFile(
                "file", "transactions.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        assertThatThrownBy(() -> csvImportService.importCsv(file, 5L, "jdoe"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Failed to import CSV");
    }

    @Test
    void importCsv_throws_whenTypeIsInvalid() {
        String csv = "date,description,category,amount,type\n"
                + "2025-01-01,Coffee,Food,4.50,NOT_A_TYPE\n";

        MockMultipartFile file = new MockMultipartFile(
                "file", "transactions.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        assertThatThrownBy(() -> csvImportService.importCsv(file, 5L, "jdoe"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Failed to import CSV");
    }

    @Test
    void importCsv_handlesQuotedFieldsWithCommasAndQuotes() {
        String csv = "date,description,category,amount,type\n"
                + "2025-01-01,\"Lunch, coffee\",Food,12.50,EXPENSE\n"
                + "2025-01-02,\"The \"\"best\"\" pizza\",Food,9.90,EXPENSE\n";

        MockMultipartFile file = new MockMultipartFile(
                "file", "transactions.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        when(transactionService.createTransactionFromCsv(any(TransactionRequest.class), eq("jdoe")))
                .thenReturn(TransactionResponse.builder().id(1L).build());

        int count = csvImportService.importCsv(file, 5L, "jdoe");

        assertThat(count).isEqualTo(2);
        ArgumentCaptor<TransactionRequest> captor = ArgumentCaptor.forClass(TransactionRequest.class);
        verify(transactionService, times(2)).createTransactionFromCsv(captor.capture(), eq("jdoe"));
        assertThat(captor.getAllValues().get(0).getDescription()).isEqualTo("Lunch, coffee");
        assertThat(captor.getAllValues().get(0).getAmount()).isEqualTo(12.50);
        assertThat(captor.getAllValues().get(1).getDescription()).isEqualTo("The \"best\" pizza");
    }

    @Test
    void importCsv_acceptsTheAppsOwnExportFormat() {
        // Same header and quoting as CsvExportController produces
        String csv = "date,description,category,amount,type,account\r\n"
                + "2025-06-01,\"Lunch, coffee\",Food,12.5,EXPENSE,Main\r\n";

        MockMultipartFile file = new MockMultipartFile(
                "file", "transactions.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        when(transactionService.createTransactionFromCsv(any(TransactionRequest.class), eq("jdoe")))
                .thenReturn(TransactionResponse.builder().id(1L).build());

        assertThat(csvImportService.importCsv(file, 5L, "jdoe")).isEqualTo(1);

        ArgumentCaptor<TransactionRequest> captor = ArgumentCaptor.forClass(TransactionRequest.class);
        verify(transactionService).createTransactionFromCsv(captor.capture(), eq("jdoe"));
        assertThat(captor.getValue().getDescription()).isEqualTo("Lunch, coffee");
        assertThat(captor.getValue().getCategory()).isEqualTo("Food");
    }

    @Test
    void importCsv_throws_whenQuoteIsNotClosed() {
        String csv = "date,description,category,amount,type\n"
                + "2025-01-01,\"Lunch, coffee,Food,12.50,EXPENSE\n";

        MockMultipartFile file = new MockMultipartFile(
                "file", "transactions.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        assertThatThrownBy(() -> csvImportService.importCsv(file, 5L, "jdoe"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Failed to import CSV");
    }
    
    @Test
    void importCsv_propagatesSecurityException_whenAccountNotOwned() {
        String csv = "date,description,category,amount,type\n"
                + "2025-01-01,Coffee,Food,4.50,EXPENSE\n";

        MockMultipartFile file = new MockMultipartFile(
                "file", "transactions.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

        when(transactionService.createTransactionFromCsv(any(TransactionRequest.class), eq("jdoe")))
                .thenThrow(new SecurityException("Account does not belong to user"));

        assertThatThrownBy(() -> csvImportService.importCsv(file, 5L, "jdoe"))
                .isInstanceOf(SecurityException.class);
    }
}