-- V1__create_users.sql
CREATE TABLE users (
    id          VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    github_id   BIGINT UNIQUE NOT NULL,
    github_username VARCHAR(100) UNIQUE NOT NULL,
    name        VARCHAR(200),
    email       VARCHAR(255) UNIQUE,
    avatar_url  TEXT,
    bio         TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_github_id ON users(github_id);
