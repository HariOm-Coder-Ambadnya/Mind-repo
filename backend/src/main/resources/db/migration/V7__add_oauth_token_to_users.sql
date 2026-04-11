-- V7__add_oauth_token_to_users.sql
-- Add column to store user's GitHub OAuth access token for API calls

ALTER TABLE users
ADD COLUMN oauth_access_token TEXT;

-- Add index for lookups when authenticating with GitHub API
CREATE INDEX idx_users_oauth_token ON users(oauth_access_token) WHERE oauth_access_token IS NOT NULL;
