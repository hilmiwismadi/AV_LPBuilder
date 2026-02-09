ALTER TABLE chat_history ADD COLUMN IF NOT EXISTS phone_hash TEXT;

CREATE INDEX IF NOT EXISTS chat_history_phone_hash_idx ON chat_history(phone_hash);

ALTER TABLE chat_history ALTER COLUMN client_id DROP NOT NULL;

ALTER TABLE chat_history DROP CONSTRAINT IF EXISTS chat_history_clientId_fkey;
ALTER TABLE chat_history ADD CONSTRAINT chat_history_clientId_fkey 
  FOREIGN KEY (client_id) 
  REFERENCES clients(id) 
  ON DELETE SET NULL 
  ON UPDATE CASCADE;
