-- V4__create_decisions.sql
CREATE TYPE decision_status AS ENUM (
    'PROPOSED',
    'ACCEPTED',
    'SUPERSEDED',
    'DEPRECATED'
);

CREATE TABLE decisions (
    id            VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title         VARCHAR(500) NOT NULL,
    body          TEXT NOT NULL,
    status        decision_status NOT NULL DEFAULT 'PROPOSED',
    author_id     VARCHAR(36) NOT NULL REFERENCES users(id),
    repo_id       VARCHAR(36) NOT NULL REFERENCES repos(id) ON DELETE CASCADE,
    tags          TEXT[] NOT NULL DEFAULT '{}',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    search_vector TSVECTOR
);

CREATE INDEX idx_decisions_repo_id   ON decisions(repo_id);
CREATE INDEX idx_decisions_author_id ON decisions(author_id);
CREATE INDEX idx_decisions_status    ON decisions(status);
CREATE INDEX idx_decisions_search    ON decisions USING GIN(search_vector);

CREATE OR REPLACE FUNCTION decisions_search_vector_update() RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english',
        COALESCE(NEW.title, '') || ' ' ||
        COALESCE(array_to_string(NEW.tags, ' '), '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER decisions_search_vector_trigger
    BEFORE INSERT OR UPDATE ON decisions
    FOR EACH ROW EXECUTE FUNCTION decisions_search_vector_update();

CREATE TABLE decision_pr_links (
    id          VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    decision_id VARCHAR(36) NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    pr_number   INT NOT NULL,
    pr_title    VARCHAR(500) NOT NULL,
    pr_url      TEXT NOT NULL,
    pr_state    VARCHAR(20) NOT NULL DEFAULT 'open',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(decision_id, pr_number)
);

CREATE TABLE decision_refs (
    id          VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    from_id     VARCHAR(36) NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    to_id       VARCHAR(36) NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(from_id, to_id)
);

CREATE TABLE comments (
    id          VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    decision_id VARCHAR(36) NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    author_id   VARCHAR(36) NOT NULL REFERENCES users(id),
    body        TEXT NOT NULL,
    parent_id   VARCHAR(36) REFERENCES comments(id),
    resolved    BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE activities (
    id          VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    org_id      VARCHAR(36) NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    user_id     VARCHAR(36) NOT NULL REFERENCES users(id),
    decision_id VARCHAR(36) REFERENCES decisions(id) ON DELETE SET NULL,
    action      VARCHAR(100) NOT NULL,
    meta        JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activities_org_created ON activities(org_id, created_at DESC);
