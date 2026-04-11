-- V3__create_repos.sql
CREATE TABLE repos (
    id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    org_id          VARCHAR(36) NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    full_name       VARCHAR(300) NOT NULL,
    github_repo_id  BIGINT UNIQUE NOT NULL,
    description     TEXT,
    private         BOOLEAN NOT NULL DEFAULT false,
    default_branch  VARCHAR(100) NOT NULL DEFAULT 'main',
    webhook_id      BIGINT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(org_id, github_repo_id)
);
