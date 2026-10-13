# Getting started

## Prerequisites

- Node.js with Bun available on `PATH`

## Install and run

```bash
bun install
bun run dev
```

Open the local Vite URL printed in the terminal. To use the supplied demo corpus, choose **Load Demo Corpus** in the application. The fixture is processed through the same ingestion and audit pipeline as uploaded files.

## Build a production bundle

```bash
bun run build
bun run preview
```

The project is a static Vite build. No application server or database is configured in the repository.

## Supported uploads

The parser registry supports PDF, DOCX, XLSX, CSV, TXT, Markdown, JSON, and YAML/YML files. Each file is checked for a supported extension and a 25 MB size limit before parsing.

## Demo corpus

The demo corpus is defined in `src/core/demo/corpus.ts`. It contains five fictional ClaimsAgent documents designed to exercise human approval, logging, data access, monitoring, incident response, tool governance, and prompt-injection handling. The corpus is synthetic and should not be read as evidence about a real organisation.
