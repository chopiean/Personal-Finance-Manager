package fi.haagahelia.financemanager.user;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class UserRepositoryTest {

    @org.springframework.beans.factory.annotation.Autowired
    private UserRepository userRepository;

    @Test
    void findByUsername_returnsUser_whenExists() {
        User user = new User("jdoe", "jdoe@example.com", "hashed", "ROLE_USER");
        userRepository.save(user);

        assertThat(userRepository.findByUsername("jdoe")).isPresent();
        assertThat(userRepository.findByUsername("nope")).isEmpty();
    }

    @Test
    void findByEmail_returnsUser_whenExists() {
        User user = new User("jdoe", "jdoe@example.com", "hashed", "ROLE_USER");
        userRepository.save(user);

        assertThat(userRepository.findByEmail("jdoe@example.com")).isPresent();
    }

    @Test
    void findByUsernameOrEmail_matchesEither() {
        User user = new User("jdoe", "jdoe@example.com", "hashed", "ROLE_USER");
        userRepository.save(user);

        assertThat(userRepository.findByUsernameOrEmail("jdoe", "jdoe")).isPresent();
        assertThat(userRepository.findByUsernameOrEmail("jdoe@example.com", "jdoe@example.com")).isPresent();
        assertThat(userRepository.findByUsernameOrEmail("nope", "nope")).isEmpty();
    }

    @Test
    void existsByUsername_andExistsByEmail() {
        User user = new User("jdoe", "jdoe@example.com", "hashed", "ROLE_USER");
        userRepository.save(user);

        assertThat(userRepository.existsByUsername("jdoe")).isTrue();
        assertThat(userRepository.existsByUsername("ghost")).isFalse();
        assertThat(userRepository.existsByEmail("jdoe@example.com")).isTrue();
        assertThat(userRepository.existsByEmail("ghost@example.com")).isFalse();
    }

    @Test
    void save_andFindById_roundTrips() {
        User user = new User("alice", "alice@example.com", "hashed", "ROLE_USER");
        User saved = userRepository.save(user);

        assertThat(saved.getId()).isNotNull();
        assertThat(userRepository.findById(saved.getId())).isPresent();
    }
}
