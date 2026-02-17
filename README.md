# jt — JSON Tools CLI

A command-line tool for analyzing JSON objects — count properties, measure depth, compare structures, merge arrays, and check property completeness.

## Installation

```bash
npm install
npm run build
npm link        # makes `jt` available globally
```

## Usage

Every command accepts JSON as either a **raw string** or a **file path** (with the `-f` flag).

---

### `jt count`

Count top-level and total properties in a JSON object.

```bash
# From a string
jt count '{"name":"Ada","address":{"city":"London","zip":"12345"}}'

# From a file
jt count data.json -f
```

**Output:**

- Top-level property count
- Total (recursive) property count
- Per-key nested breakdown with visual bars

---

### `jt depth`

Find the maximum nesting depth and the value at the deepest path.

```bash
jt depth '{"a":{"b":{"c":42}}}'

jt depth nested.json -f
```

**Output:**

- Max depth level
- Dot-path to the deepest node
- Value at that path

---

### `jt compare`

Compare two JSON objects and show structural differences.

```bash
# From strings
jt compare '{"a":1,"b":2}' '{"a":1,"c":3}'

# From files
jt compare fileA.json fileB.json -f
```

**Output:**

- Added, removed, and changed keys
- Unchanged count
- Detailed diff with paths and values

---

### `jt merge`

Merge all objects in a JSON array into a single object. Later entries override earlier ones for duplicate keys.

```bash
jt merge '[{"a":1},{"b":2},{"a":99,"c":3}]'

jt merge objects.json -f
```

**Output:**

- Number of objects merged
- Number of unique keys
- The merged result

---

### `jt comp`

Analyze property completeness across a JSON array of objects. Shows which properties are present or missing across all items.

```bash
jt comp '[{"a":1,"b":2},{"a":3},{"a":5,"b":6,"c":7}]'

jt comp records.json -f
```

**Options:**

| Flag              | Description                               | Default |
| ----------------- | ----------------------------------------- | ------- |
| `-f, --file`      | Treat source as a file path               | —       |
| `-d, --depth <n>` | Max recursion depth for nested paths      | `9`     |
| `--no-table`      | Output as a plain list instead of a table | —       |

**Output:**

- Total objects and unique property paths
- Per-property table with present/missing counts and percentages
- Sorted by most-missing first

---

## Development

```bash
npm run dev          # run CLI via tsx (no build needed)
npm test             # run all tests
npm run test:watch   # run tests in watch mode
npm run build        # compile TypeScript to dist/
```

## License

MIT
