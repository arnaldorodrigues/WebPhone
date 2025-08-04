# Extension Number API Routes

This directory contains API routes for managing and querying extension numbers in the WebPhone project.

## Routes

### GET /api/en
Retrieves all extension numbers from the FusionPBX database.

**Response:**
```json
{
  "success": true,
  "data": ["1001", "1002", "1003"]
}
```

### GET /api/en/registered
Retrieves all registered extension numbers from FreeSWITCH.

**Response:**
```json
{
  "success": true,
  "data": ["1001", "1002"]
}
```

### GET /api/en/registered/[extension]
Checks if a specific extension is registered with FreeSWITCH.

**Parameters:**
- `extension`: The extension number to check

**Response:**
```json
{
  "success": true,
  "data": "1"
}
```

## Environment Variables

These API routes use the following environment variables:

- `DB_HOST`: PostgreSQL database host (default: "127.0.0.1")
- `DB_PORT`: PostgreSQL database port (default: "5432")
- `DB_USER`: PostgreSQL database user (default: "fusionpbx")
- `DB_PASSWORD`: PostgreSQL database password
- `DB_NAME`: PostgreSQL database name (default: "fusionpbx")
- `FS_HOST`: FreeSWITCH host (default: "127.0.0.1")
- `FS_PORT`: FreeSWITCH port (default: "8021")
- `FS_PASSWORD`: FreeSWITCH password (default: "ClueCon")

## Testing

Each API route has corresponding tests in the `__tests__` directory. The tests use Vitest and mock the external dependencies (PostgreSQL and FreeSWITCH) to ensure the routes work correctly.

To run the tests:

```bash
npm test
```