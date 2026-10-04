CREATE TABLE IF NOT EXISTS payments(
    id BIGSERIAL PRIMARY KEY,
    provider_payment_id VARCHAR(100) UNIQUE NOT NULL,
    order_id VARCHAR(100) NOT NULL,
    currency VARCHAR(100) NOT NULL DEFAULT 'INR',
    amount NUMERIC(12,2) NOT NULL,
    status VARCHAR(100) NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    last_event_at TIMESTAMP NULL,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webhook_events(
    id BIGSERIAL PRIMARY KEY ,
    provider VARCHAR(100) NOT NULL,
    payment_id BIGINT REFERENCES payments(id),
    event_id VARCHAR(100)  NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(100) NOT NULL DEFAULT 'received',
    attempts INTEGER NOT NULL DEFAULT 0,
    received_at timestamp  NULL,
    processed_at timestamp  NULL,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now(),
    error TEXT NULL,

    CONSTRAINT unique_webhook_event UNIQUE (event_id,provider)
);
CREATE INDEX idx_webhook_event_status on webhook_events(status);
CREATE INDEX idx_webhook_event_payment_id  on webhook_events(payment_id);