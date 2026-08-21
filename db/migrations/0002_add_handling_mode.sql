-- Existing local/remote databases need this one-time migration.
ALTER TABLE conversations ADD COLUMN handling_mode TEXT NOT NULL DEFAULT 'ai'
  CHECK (handling_mode IN ('ai', 'operator'));

-- Recover handoff conversations created before handling_mode was persisted.
UPDATE conversations
SET handling_mode = 'operator'
WHERE EXISTS (
  SELECT 1 FROM messages
  WHERE messages.conversation_id = conversations.id
    AND messages.role = 'assistant'
    AND messages.content = '確認のうえ、担当者からご案内します。恐れ入りますが、しばらくお待ちください。'
)
AND NOT EXISTS (
  SELECT 1 FROM messages
  WHERE messages.conversation_id = conversations.id
    AND messages.role = 'operator'
);
