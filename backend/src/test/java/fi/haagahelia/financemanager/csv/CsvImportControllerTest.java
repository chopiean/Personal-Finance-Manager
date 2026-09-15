package fi.haagahelia.financemanager.csv;

import fi.haagahelia.financemanager.security.JwtService;
import fi.haagahelia.financemanager.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CsvImportController.class)
@Import(fi.haagahelia.financemanager.security.SecurityConfig.class)
class CsvImportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CsvImportService csvImportService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;

    @Test
    void uploadCsv_returns401_whenUnauthenticated() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "tx.csv", "text/csv", "date,description,category,amount,type\n".getBytes(StandardCharsets.UTF_8));

        mockMvc.perform(multipart("/api/csv/import").file(file).param("accountId", "1"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser(username = "jdoe")
    void uploadCsv_returnsImportedCount() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "tx.csv", "text/csv", "date,description,category,amount,type\n".getBytes(StandardCharsets.UTF_8));

        when(csvImportService.importCsv(any(), eq(1L))).thenReturn(3);

        mockMvc.perform(multipart("/api/csv/import").file(file).param("accountId", "1"))
                .andExpect(status().isOk())
                .andExpect(content().string("3 transactions imported"));
    }
}
