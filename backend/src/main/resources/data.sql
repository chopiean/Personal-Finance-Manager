DELETE FROM users;

INSERT INTO users (username, password, role)
VALUES (
    'an@example.com',
    '$2a$10$wl/5HMx3HggP7Jm7eS2GeOlLX9IEibVxS8G66Q.uVzEUCxYI0I7i',
    'ROLE_USER'
);

