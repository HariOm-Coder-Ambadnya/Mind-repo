-- V6__decision_votes.sql
CREATE TABLE decision_votes (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    decision_id VARCHAR(36) NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),
    vote SMALLINT NOT NULL CHECK (vote IN (-1, 1)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(decision_id, user_id)
);

CREATE INDEX idx_decision_votes_decision_id ON decision_votes(decision_id);
CREATE INDEX idx_decision_votes_user_id ON decision_votes(user_id);
