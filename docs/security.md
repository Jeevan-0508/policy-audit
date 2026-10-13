# Security and privacy boundaries

## Untrusted document content

Uploaded text is treated as evidence content, not as instructions. Every parsed chunk is scanned by `src/core/security/injection.ts` for instruction-like patterns such as attempts to override rules, mark a control compliant, or impersonate a system instruction.

When a pattern is found, the application records an `InjectionFlag` with a snippet, optional page number, and reason. The text is retained as evidence; it is not silently removed.

`isolateUntrustedText` wraps text in an explicit untrusted-content boundary for any future model-assisted prompt path.

## Browser-local processing

The current store keeps ingested documents and audit results in memory. The repository contains no database, API server, authentication layer, telemetry client, or persistence adapter. Closing or refreshing the browser discards the working corpus.

## File fingerprinting

The document record includes a deterministic FNV-1a fingerprint derived from up to the first 1,000,000 characters plus the file size. This is useful for a lightweight local identifier, but it is not a cryptographic hash and must not be treated as one.

## Privacy limitations

Browser-local processing reduces transmission risk, but it is not a substitute for an organisation’s endpoint, browser, retention, access-control, or incident-response policy. Do not upload sensitive production material to an untrusted machine or browser session.
