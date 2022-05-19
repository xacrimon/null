CREATE TABLE pastes (
    id INTEGER PRIMARY KEY,
    created INTEGER NOT NULL,
    expiry INTEGER,
    title TEXT,
    author TEXT,
    lang TEXT NOT NULL,
    content TEXT NOT NULL
);

CREATE TABLE accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    public_email TEXT,
    display_name TEXT,
    pronouns TEXT
);

CREATE TABLE identities (
    account_id INTEGER NOT NULL,
    provider TEXT,
    pw_hash TEXT
);

CREATE TABLE refresh_tokens (
    token TEXT PRIMARY KEY,
    account_id INTEGER NOT NULL,
    expiry INTEGER NOT NULL
);
