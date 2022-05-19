CREATE TABLE pastes (
    id INTEGER NOT NULL PRIMARY KEY,
    author_id INTEGER NOT NULL,
    created INTEGER NOT NULL,
    expiry INTEGER,
    title TEXT,
    lang TEXT NOT NULL,
    content TEXT NOT NULL
);

CREATE INDEX pastes_author_id_index ON pastes (author_id);

CREATE TABLE saved_pastes (
    account_id INTEGER NOT NULL,
    paste_id INTEGER NOT NULL
);

CREATE INDEX saved_pastes_account_id_index ON saved_pastes (account_id);

CREATE TABLE accounts (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    public_email TEXT,
    display_name TEXT,
    pronouns TEXT
);

CREATE UNIQUE INDEX accounts_username_index ON accounts (username);
CREATE UNIQUE INDEX accounts_email_index ON accounts (email);

CREATE TABLE identities (
    account_id INTEGER NOT NULL,
    provider TEXT NOT NULL,
    pw_hash TEXT,
    PRIMARY KEY (account_id, provider)
);

CREATE TABLE refresh_tokens (
    token TEXT NOT NULL PRIMARY KEY,
    account_id INTEGER NOT NULL,
    expiry INTEGER NOT NULL
);
