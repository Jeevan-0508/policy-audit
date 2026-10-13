# Limitations

- The framework catalogue is an engineering crosswalk and reference aid, not legal advice or a certification decision.
- Requirement matching and evidence classification are deterministic keyword and pattern-based logic in the current implementation. They can miss context, synonyms, negation, or domain-specific meaning.
- PDF, DOCX, XLSX, CSV, TXT, Markdown, JSON, and YAML parsing has format-specific failure behavior; malformed or image-only files may produce limited evidence.
- The default audit run does not call an LLM. Any future model-assisted explanation must preserve the deterministic finding boundary and treat uploaded text as untrusted content.
- The FNV-1a document fingerprint is not cryptographic integrity protection.
- Working data is held in browser memory and is lost on refresh. There is no server-side persistence, authentication, multi-user access control, or audit-log retention service.
- Demo results use a fictional ClaimsAgent corpus and synthetic evidence.
