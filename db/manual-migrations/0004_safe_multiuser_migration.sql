
BEGIN;

-- 1. Create the users table.
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_legacy BOOLEAN NOT NULL DEFAULT FALSE
);

-- 2. Add nullable ownership to existing events.
ALTER TABLE events
ADD COLUMN user_id INTEGER;

-- 3. Create a dedicated legacy owner.
-- This account is not intended for normal login.
INSERT INTO users (
    name,
    email,
    password_hash,
    is_legacy
)
VALUES (
    'Legacy Event Owner',
    'legacy-owner@calendar-plus.invalid',
    '!LEGACY_ACCOUNT_CANNOT_LOGIN!',
    TRUE
);

-- 4. Assign all existing events to the legacy owner.
UPDATE events
SET user_id = (
    SELECT id
    FROM users
    WHERE email = 'legacy-owner@calendar-plus.invalid'
      AND is_legacy = TRUE
);

-- 5. Verify that all 11 original events have been assigned.
DO $$
DECLARE
    total_events INTEGER;
    assigned_events INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_events
    FROM events;

    SELECT COUNT(*) INTO assigned_events
    FROM events
    WHERE user_id IS NOT NULL;

    IF total_events <> 11 OR assigned_events <> 11 THEN
        RAISE EXCEPTION
            'Migration stopped: expected 11 assigned events, found % total and % assigned',
            total_events, assigned_events;
    END IF;
END $$;

-- 6. Add the ownership foreign key.
ALTER TABLE events
ADD CONSTRAINT events_user_id_users_id_fk
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE RESTRICT
ON UPDATE NO ACTION;

-- 7. Make event ownership mandatory.
ALTER TABLE events
ALTER COLUMN user_id SET NOT NULL;

COMMIT;
