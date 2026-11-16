package fi.haagahelia.financemanager.security;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock private JwtService jwtService;
    @Mock private UserDetailsService userDetailsService;
    @Mock private FilterChain chain;

    @InjectMocks private JwtAuthenticationFilter filter;

    private MockHttpServletRequest request;
    private MockHttpServletResponse response;
    private final UserDetails jdoe = User.withUsername("jdoe").password("x").roles("USER").build();

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private Authentication auth() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    @Test
    void noAuthorizationHeader_passesThroughUnauthenticated() throws Exception {
        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
        verifyNoInteractions(jwtService, userDetailsService);
        assertThat(auth()).isNull();
    }

    @Test
    void nonBearerHeader_passesThroughUnauthenticated() throws Exception {
        request.addHeader("Authorization", "Basic abc123");

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
        verifyNoInteractions(jwtService);
        assertThat(auth()).isNull();
    }

    @Test
    void validToken_setsAuthentication() throws Exception {
        request.addHeader("Authorization", "Bearer good.token");
        when(jwtService.extractUsername("good.token")).thenReturn("jdoe");
        when(userDetailsService.loadUserByUsername("jdoe")).thenReturn(jdoe);
        when(jwtService.isTokenValid("good.token", jdoe)).thenReturn(true);

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
        assertThat(auth()).isNotNull();
        assertThat(auth().getPrincipal()).isEqualTo(jdoe);
        assertThat(auth().getAuthorities()).extracting("authority").containsExactly("ROLE_USER");
    }

    @Test
    void malformedOrExpiredToken_doesNotAuthenticate() throws Exception {
        request.addHeader("Authorization", "Bearer broken");
        when(jwtService.extractUsername("broken"))
                .thenThrow(new io.jsonwebtoken.ExpiredJwtException(null, null, "expired"));

        filter.doFilter(request, response, chain);

        verify(chain, times(1)).doFilter(request, response);
        verifyNoInteractions(userDetailsService);
        assertThat(auth()).isNull();
    }

    @Test
    void tokenForUnknownUser_doesNotAuthenticate() throws Exception {
        request.addHeader("Authorization", "Bearer ghost.token");
        when(jwtService.extractUsername("ghost.token")).thenReturn("ghost");
        when(userDetailsService.loadUserByUsername("ghost"))
                .thenThrow(new UsernameNotFoundException("nope"));

        filter.doFilter(request, response, chain);

        verify(chain, times(1)).doFilter(request, response);
        verify(jwtService, never()).isTokenValid(anyString(), any());
        assertThat(auth()).isNull();
    }

    @Test
    void invalidToken_doesNotAuthenticate() throws Exception {
        request.addHeader("Authorization", "Bearer bad.sig");
        when(jwtService.extractUsername("bad.sig")).thenReturn("jdoe");
        when(userDetailsService.loadUserByUsername("jdoe")).thenReturn(jdoe);
        when(jwtService.isTokenValid("bad.sig", jdoe)).thenReturn(false);

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
        assertThat(auth()).isNull();
    }

    @Test
    void nullUsernameInToken_doesNotAuthenticate() throws Exception {
        request.addHeader("Authorization", "Bearer no.subject");
        when(jwtService.extractUsername("no.subject")).thenReturn(null);

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
        verifyNoInteractions(userDetailsService);
        assertThat(auth()).isNull();
    }

    @Test
    void existingAuthentication_isNotReplaced() throws Exception {
        Authentication existing = new UsernamePasswordAuthenticationToken("someone", null, List.of());
        SecurityContextHolder.getContext().setAuthentication(existing);
        request.addHeader("Authorization", "Bearer good.token");
        when(jwtService.extractUsername("good.token")).thenReturn("jdoe");

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
        verifyNoInteractions(userDetailsService);
        assertThat(auth()).isSameAs(existing);
    }
}
