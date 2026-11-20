# Sahay-AI: Security, Privacy & Data Retention Policy

**Effective Date:** March 2026  
**Compliance Standard:** Digital Personal Data Protection (DPDP) Act 2023 / RBI Cybersecurity Guidelines / ISO 27001 Controls  
**Scope:** Covers all entrepreneur personal data, micro-enterprise operational telemetry, and uploaded vault documentation.

---

## 1. Core Security Guarantees

Sahay-AI is engineered with a **zero-trust, security-by-default architecture** designed specifically to protect vulnerable micro-entrepreneurs:

1. **No Data Siphoning for AI Training**: No personal financial records, income assertions, or customer documents are ever transmitted to third-party LLMs for public training.
2. **Encrypted Storage at Rest**: Sensitive financial indicators (PAN, Aadhaar numbers, Bank Account numbers) are stored encrypted at rest using **AES-128-CBC with HMAC-SHA256 authenticated integrity** (`Fernet`).
3. **Mandatory Masking in User Interfaces & Logs**:
   - **PAN**: Displayed only with mask format (`ABCDE****F`).
   - **Aadhaar**: Displayed with standard UIDAI-compliant mask (`XXXX-XXXX-1234`).
   - **Bank Account**: Masked showing only terminal 4 digits (`XXXXXXX1234`).
4. **Isolated Vault Object Storage**:
   - Binary uploads (PDF, PNG, JPEG) are saved outside the public web root in `vault_storage/<user_id>/`.
   - File uploads are validated via strict magic-byte signatures and capped at 10MB to prevent arbitrary code execution or zip bombs.
   - Server-side SHA-256 checksums are calculated on ingestion to guarantee immutable tamper detection.
5. **Strict Tenant & Role-Based Access Control (RBAC)**:
   - Every private endpoint enforces authenticated Bearer JWT tokens.
   - Cross-user tenant isolation is verified on every query (`WHERE user_id = current_user.id`).
   - Administrative consoles require explicit `admin` or `super_admin` credentials; unprivileged callers receive immediate HTTP 403 Forbidden.
   - All administrative actions are recorded in an immutable append-only audit trail (`audit_logs`).

---

## 2. Data Classification Matrix

| Tier | Category | Examples | Encryption / Protection | Retention Period |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1** | Public Knowledge | Scheme criteria, nodal ministry URLs, state guidelines | Public, read-only cache | Indefinite; re-verified every 180 days |
| **Tier 2** | Enterprise Profile | Turnover, business sector, Udyam registration status | Row-level tenant isolation | Duration of active account |
| **Tier 3** | Sensitive Identifiers | PAN, Aadhaar, Bank Account Numbers | AES-128-CBC + HMAC-SHA256 + Display Masking | Duration of active account |
| **Tier 4** | Document Binaries | Udyam certificates, bank statements, project DPRs | SHA-256 Checksum, Storage Sandbox | Duration of active application or user deletion |
| **Tier 5** | Audit Ledger | Admin scheme updates, consent grants, data erasures | Immutable append-only SQLite/Postgres log | 365 days for regulatory audit |

---

## 3. Statutory Right to Erasure ("Right to Be Forgotten")

Under the Digital Personal Data Protection (DPDP) Act 2023, every entrepreneur holds unconditional rights regarding their personal and enterprise data:

1. **Document Erasure**:
   - Calling `DELETE /api/v1/documents/{document_id}` unlinks and shreds the physical file binary from disk immediately and removes the database record.
2. **Full Account Erasure**:
   - Calling `DELETE /api/v1/auth/me` irrevocably purges the user account, deletes all associated document files from disk, resets third-party consent grants, and records an erasure event in the audit trail.
3. **Consent Revocation**:
   - Consent granted to lending partners (e.g. State Bank of India MSME Hub) can be revoked on-demand from the Applications page (`POST /api/v1/applications/{id}/consent` with `consent_granted=false`), terminating partner data visibility.

---

## 4. Secret & Credential Management Policy

1. **Zero Repository Secrets**: No API keys, database credentials, or JWT signing secrets are committed to version control.
2. **Environment Variable Hierarchy**:
   - Local development uses `.env` and `backend/.env` (both Git-ignored).
   - Production secrets are injected exclusively via hosting platform secret stores (Render, Vercel).
3. **Automated Secret Scans**: Automated CI and pre-commit checks run regular regex and pattern matching scans for accidental credential leakage.

---

## 5. Security Incident Contact

Security concerns or vulnerability disclosures may be reported to:
- **Security Officer**: `security@sahay-ai.local`
- **Response SLA**: High-severity vulnerability acknowledgments within 24 hours; remediation deployment within 72 hours.
