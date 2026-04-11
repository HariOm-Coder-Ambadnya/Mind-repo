-- V8__create_personal_orgs_for_users.sql
-- Create personal orgs for existing users who don't have any org memberships

-- Create personal orgs for users without any memberships
INSERT INTO orgs (id, name, slug, description, created_at, updated_at)
SELECT 
    gen_random_uuid()::text,
    u.github_username || '''s workspace',
    LOWER(REGEXP_REPLACE(u.github_username, '[^a-zA-Z0-9-]', '-', 'g')),
    'Personal workspace for ' || u.github_username,
    NOW(),
    NOW()
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM org_members om WHERE om.user_id = u.id
);

-- Add memberships for those users to their personal orgs
INSERT INTO org_members (id, org_id, user_id, role, joined_at)
SELECT 
    gen_random_uuid()::text,
    o.id,
    u.id,
    'OWNER'::org_role,
    NOW()
FROM users u
JOIN orgs o ON o.slug = LOWER(REGEXP_REPLACE(u.github_username, '[^a-zA-Z0-9-]', '-', 'g'))
WHERE NOT EXISTS (
    SELECT 1 FROM org_members om WHERE om.user_id = u.id
);
