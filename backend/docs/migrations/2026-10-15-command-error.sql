-- Run against the application's MySQL database with the backend stopped,
-- before starting the version that removes TIMEOUT from ActionStatus.
-- Repeatable: preserves history IDs, actions and device states.
START TRANSACTION;
UPDATE `action` SET `status` = 'ERROR' WHERE `status` = 'TIMEOUT';
COMMIT;
-- Hibernate ddl-auto=update updates the enum column on the next startup.
