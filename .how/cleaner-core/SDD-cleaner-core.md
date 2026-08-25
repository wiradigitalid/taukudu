---
type: sdd
component: 'cleaner-core'
status: draft
created: '2026-08-25'
updated: '2026-08-25'
realizes: ["UC-CLEAN-1", "UC-CLEAN-2", "UC-CLEAN-3", "UC-CLEAN-4", "UC-CLEAN-5", "UC-CLEAN-6"]
binds: []
reviewed:
  date: ''
  sha: ''
  lenses: []
---

# SDD — cleaner-core

## Decision Summary · [outline]
Skeletong SDD untuk cleaner-core (pada mode catalog, G4 dilewati dan detail teknis dipusatkan di Blueprint G3).

## Structure · [outline]
- Engine: `walkdir` + `rayon` + JSON rules parser.
