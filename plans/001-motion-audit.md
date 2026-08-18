# Plan: Full Design System Audit — Mela
Commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'arena/01a016cb-mela')
Standard: Apple fluid interfaces + improve-animations (AUDIT.md)
Scope: full src/ + CSS; read-only, output to plans/
Findings: reduced-motion present (good); springs/interruptibility missing; velocity handoff absent
Next: add spring libraries, 1:1 pointer tracking, velocity projection, rubber-band
