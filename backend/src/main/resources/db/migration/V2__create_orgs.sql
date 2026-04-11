-- V2__create_orgs.sql
CREATE TYPE org_role AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

CREATE TABLE orgs (
    id          VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name        VARCHAR(200) NOT NULL,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    avatar_url  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE org_members (
    id          VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    org_id      VARCHAR(36) NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    user_id     VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role        org_role NOT NULL DEFAULT 'MEMBER',
    joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(org_id, user_id)
);

CREATE TABLE org_invites (
    id          VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    org_id      VARCHAR(36) NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    email       VARCHAR(255) NOT NULL,
    role        org_role NOT NULL DEFAULT 'MEMBER',
    token       VARCHAR(100) UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(org_id, email)
);
