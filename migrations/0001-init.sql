CREATE TABLE pastes (
    id INTEGER PRIMARY KEY,
    created INTEGER NOT NULL,
    expiry INTEGER,
    title TEXT,
    author TEXT,
    lang TEXT NOT NULL,
    content TEXT NOT NULL
);
