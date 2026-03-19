# Security

## Credential Storage

Jira API tokens, Xray client secrets, and other credentials entered in the Settings UI are encrypted before being stored in the database.

**Encryption:** AES-256-CBC using a 32-byte key derived from `NEXTAUTH_SECRET` (SHA-256 hash). Each value gets a unique random IV prepended to the ciphertext.

**Never logged:** Credential values are never written to application logs or included in error messages.

**API redaction:** The `GET /api/settings` endpoint returns `hasJiraToken: boolean` instead of the actual token value. Raw credentials are never returned to the frontend.

## Authentication

- Session tokens are signed JWTs using `NEXTAUTH_SECRET`
- Passwords are hashed with bcrypt (cost factor 10) before storage
- All dashboard routes require an authenticated session

## Recommendations for Production

- Rotate `NEXTAUTH_SECRET` periodically (invalidates all sessions)
- Use a strong, randomly-generated `NEXTAUTH_SECRET` (minimum 32 bytes)
- Restrict database access to the application server only
- Use TLS for all connections (database, Jira API, Xray API)
- Set `NEXTAUTH_URL` to your exact production URL to prevent open redirect attacks
