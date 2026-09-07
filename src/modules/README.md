# Module Convention

Setiap module mengikuti prinsip `Create structure when needed` — tidak semua sub-folder wajib dibuat di awal.

Struktur opsional per module:

```
module/
├── components/   # UI khusus module (jika ada)
├── actions/      # Server Actions / Route Handlers
├── services/     # Business logic & orchestration
├── repositories/ # Data access (Drizzle queries)
├── schemas/      # Zod validation
├── types/        # Type spesifik module
└── tests/        # Unit/integration tests
```

Aturan:
- `services/` tidak boleh berisi query DB langsung — delegasi ke `repositories/`
- `repositories/` tidak boleh berisi business rule / authorization
- `schemas/` validasi server-side via Zod, dipakai sebelum `services/`
- `actions/` hanya orchestration tipis: validate → authorize → service → response

Module di Phase 1 masih kosong — folder dibuat sebagai boundary untuk Phase berikutnya.
