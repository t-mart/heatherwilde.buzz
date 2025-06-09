# heatherwilde.net

Status of the Optimum Internet service as seens from customer data in
the Heatherwilde community of Pflugerville, TX.

## DevOps

### Updating the database schema types

Nushell:

```nushell
pnpm --silent gen-db-types | save --force src\lib\db\schema.ts
```

Bash:

```bash
pnpm --silent gen-db-types > src/lib/db/schema.ts
```
