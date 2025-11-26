DELETE FROM users;

INSERT INTO users (username, password, role)
VALUES (
    'an@example.com',
    '$2a$12$928/9iUh15sOi83OlTd07OU7DUSYRLqvrbNte8gfrpwKdZ2mIK73G',
    'ROLE_USER'
);

