# Testing and validation

## Commands

```bash
bun test
bun run typecheck
bun run build
```

## Current coverage areas

The test suite in `src/core/engine/audit.test.ts` covers deterministic classification, requirement matching, finding generation, contradiction detection, implementation-gap detection, and agent-governance profile generation. `src/core/demo/corpus.test.ts` checks that the fixture corpus is shaped as expected.

The tests exercise the core engine with the same typed data model used by the UI. They do not replace browser-level testing of every screen or parser format.

## Release checklist

Before publishing a change:

1. Run the three commands above.
2. Load the demo corpus and inspect the Overview, Findings, Contradictions, Agent Governance, Technical Translation, and Reports screens.
3. Upload representative files for any parser changed in the branch.
4. Confirm that evidence retains document and section provenance.
5. Review security and limitation statements for any new model-assisted behavior.
