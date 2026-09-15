-- Images move from MinIO object storage into Postgres (bytea), served by the
-- backend at /api/images/**. Removes the need for a separate object-storage
-- service in every environment (local compose, Render/Neon cloud lab).

CREATE TABLE foodme.image (
    path         VARCHAR(512) PRIMARY KEY,
    content_type VARCHAR(100) NOT NULL,
    data         BYTEA        NOT NULL
);

-- Rewrite stored MinIO URLs (http://host:9000/<bucket>/<path>) to API-relative
-- image paths (/api/images/<path>). The backend absolutizes them per request.
UPDATE foodme.chef SET avatar_url = regexp_replace(avatar_url, '^https?://[^/]+/[^/]+/', '/api/images/') WHERE avatar_url IS NOT NULL;
UPDATE foodme.chef SET banner_url = regexp_replace(banner_url, '^https?://[^/]+/[^/]+/', '/api/images/') WHERE banner_url IS NOT NULL;
UPDATE foodme.dish SET url        = regexp_replace(url,        '^https?://[^/]+/[^/]+/', '/api/images/') WHERE url IS NOT NULL;
