# Product Glossary

**Loaded when:** writing any document in the corpus.

The SSOT for **product** vocabulary — what this product talks about. Every term is defined **once**
here, then used as-is across the corpus.

**Method** vocabulary lives in `.constitution/method-glossary.md` and MUST NOT be redefined here. The
split test: does this term still hold if used in another product? Yes → `method-glossary.md`, no →
here.

## Rules

- A new term appearing in any document MUST be added here **in the same pass**.
- A definition MUST name its relationship to other terms and its cardinality where relevant.
- One term MUST NOT have two entries.
- This file is born **empty** and filled from the product. Its first entries are born with the brief at G1.

## Entries

<!-- Alphabetical. Format: **Term** — definition. Relationship. Cardinality where relevant. -->

- **Cleaner Rule** — A JSON file defining a specific cleaning target (e.g., browser cache, temp files), including paths to scan, files to delete, and platform applicability. One cleaner rule per cleaning target.
- **Cleaning Session** — A single execution of one or more cleaner rules that scans and/or removes files, producing a result record in the cleaning history.
- **Disk Treemap** — An interactive hierarchical visualization of disk space usage by folder and file size.
- **Heuristic Analysis** — Malware detection technique analyzing file behavior and characteristics rather than static signatures alone.
- **One-Click Clean** — An automated workflow that runs a predefined set of safe cleaner rules across all enabled categories in a single user action.
- **Privacy Shield** — A subsystem for toggling OS-level telemetry, tracking, and diagnostic data collection settings.
- **Restore Point** — A system snapshot created before cleaning operations to allow recovery in case of system instability.
- **Secure Delete** — A file deletion method that overwrites file contents with random data before unlinking from the filesystem.
- **Startup Impact** — A measured or estimated metric of how much a startup program delays system boot time.
- **YARA Rule** — A pattern-matching rule used by the malware scanner to identify malicious files by signature or behavior pattern.
