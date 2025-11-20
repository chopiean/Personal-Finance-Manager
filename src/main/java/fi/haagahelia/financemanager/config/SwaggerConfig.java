package fi.haagahelia.financemanager.config;

import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.OpenAPI;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
    
    @Bean
    public OpenAPI financeManagerOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                    .title("Personal Finance Manager API")
                    .version("1.0.0")
                    .description("Backend API for managing personal finance."));
    }
}
