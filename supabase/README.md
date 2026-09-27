# Atlas Supabase migration discipline

`supabase/migrations/` contains the source-controlled Atlas database evolution files.

These files are **not browser runtime scripts** and are excluded from the public static Atlas deployment.

## Production rule

> **Once a migration has been applied to production, its source file is immutable.**

If deployed schema behavior needs to change:

1. create a new migration;
2. apply that new migration through the intentional Supabase migration process;
3. commit the exact migration source;
4. verify the production schema/change after application.

Do not edit an already-applied migration to make the historical sequence look cleaner.

## Historical provenance

Atlas's existing numbered migration files and the live Supabase migration ledger do not map one-to-one.

During the repository hygiene audit, production contained several schema objects/functions represented by repository migrations whose exact migration names were absent from the live ledger. Production also retained an additional `optimize_compass_suggestion_rls` ledger entry whose final policy form had already been folded into the repository's Compass suggestion migration.

The inspected production schema therefore appeared aligned for those objects, but the two histories are not literal mirrors.

Treat this as historical provenance, not something to rewrite destructively.

**Going forward, preserve one migration file per applied production change.**

## Deployment boundary

No current GitHub Actions workflow automatically applies this directory to Supabase production.

A commit containing migration SQL does **not** by itself mean production schema changed.

Database work must have an explicit application and verification step.

## Security expectations

For Atlas database changes:

- durable account data must retain an explicit authorization boundary;
- exposed account-owned tables require appropriate RLS and browser-role privileges;
- server-owned billing/AI policy state must not become browser-mutable;
- privileged functions must keep their execution grants and authentication assumptions explicit;
- migration changes should be additive and reviewable.

For current schema truth, production Supabase is authoritative. For intended source-controlled evolution, this directory is authoritative. Keep the two synchronized from this point forward.
