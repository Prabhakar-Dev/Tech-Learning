# PostgreSQL Basics

A short reference for common SQL operations on **PostgreSQL** — from schema design to querying, aggregating, and modifying data.

## Table of Contents

1. [Fundamentals](#1-fundamentals)
   - [SQL Comments](#11-sql-comments)
2. [Schema Management](#2-schema-management)
   - [Database Creation and Removal](#21-database-creation-and-removal)
   - [Table Creation and Removal](#22-table-creation-and-removal)
   - [Table Constraints](#23-table-constraints)
   - [Auto-Increment Columns](#24-auto-increment-columns)
3. [Data Manipulation](#3-data-manipulation)
   - [Inserting Data](#31-inserting-data)
   - [Updating Data](#32-updating-data)
   - [Deleting Data](#33-deleting-data)
4. [Querying Data](#4-querying-data)
   - [Selecting Data](#41-selecting-data)
   - [Distinct Values](#42-distinct-values)
   - [Sorting Results](#43-sorting-results)
   - [Filtering with WHERE](#44-filtering-with-where)
   - [Pattern Matching with LIKE](#45-pattern-matching-with-like)
   - [String Functions](#46-string-functions)
5. [Aggregation](#5-aggregation)
   - [Aggregate Functions](#51-aggregate-functions)
   - [Grouping Data](#52-grouping-data)
6. [Utility Operations](#6-utility-operations)
   - [Table Backup with SELECT INTO](#61-table-backup-with-select-into)

---

## 1. Fundamentals

Core syntax conventions used throughout PostgreSQL.

### 1.1 SQL Comments

Comments document intent and are ignored by the database engine.

```sql
-- Single-line comment

/*
  Multi-line comment
  useful for longer notes
*/

SELECT name FROM employees; -- inline comment
```

---

## 2. Schema Management

Define and manage databases and tables — the structure that holds your data.

### 2.1 Database Creation and Removal

A **database** is a container for tables, views, and other objects. Create one before creating tables; drop it only when the data is no longer needed.

```sql
CREATE DATABASE company_db;

-- Connect via psql (not an in-session USE like other engines)
-- \c company_db

DROP DATABASE company_db;

-- Safer variant
DROP DATABASE IF EXISTS company_db;
```

### 2.2 Table Creation and Removal

A **table** stores related data in rows and columns. Define column names and data types at creation time.

```sql
CREATE TABLE employees (
  id INT,
  name VARCHAR(100),
  department VARCHAR(50),
  salary DECIMAL(10, 2)
);

DROP TABLE employees;
DROP TABLE IF EXISTS employees;
```

### 2.3 Table Constraints

**Constraints** enforce rules on columns so invalid data cannot be stored.

| Constraint    | Meaning                           |
| ------------- | --------------------------------- |
| `PRIMARY KEY` | Unique identifier for each row    |
| `NOT NULL`    | Value is required                 |
| `UNIQUE`      | No duplicate values allowed       |
| `FOREIGN KEY` | Must match a key in another table |
| `CHECK`       | Value must satisfy a condition    |
| `DEFAULT`     | Value used when none is provided  |

```sql
CREATE TABLE employees (
  id INT PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(50) DEFAULT 'General',
  salary DECIMAL(10, 2) CHECK (salary > 0)
);
```

### 2.4 Auto-Increment Columns

Auto-increment generates the next integer ID automatically on insert. Prefer `GENERATED ... AS IDENTITY`; `SERIAL` is the older shorthand.

```sql
-- Recommended
CREATE TABLE employees (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(50)
);

INSERT INTO employees (name, department)
VALUES ('Alice', 'Engineering');
```

```sql
-- Older SERIAL shorthand
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);
```

---

## 3. Data Manipulation

Add, change, or remove rows in existing tables (DML).

### 3.1 Inserting Data

Use `INSERT` to add one or more rows. List columns explicitly so value order is clear.

```sql
INSERT INTO employees (id, name, department, salary)
VALUES (1, 'Alice', 'Engineering', 75000);

-- Multiple rows at once
INSERT INTO employees (id, name, department, salary)
VALUES
  (2, 'Bob', 'Sales', 62000),
  (3, 'Carol', 'Engineering', 80000);
```

### 3.2 Updating Data

`UPDATE` changes existing values. Always include `WHERE` unless you intend to update every row.

```sql
UPDATE employees
SET salary = 78000
WHERE id = 1;

-- Update multiple columns
UPDATE employees
SET department = 'Product', salary = 82000
WHERE name = 'Carol';
```

> Warning: `UPDATE employees SET salary = 0;` with no `WHERE` updates **all** rows.

### 3.3 Deleting Data

`DELETE` removes specific rows. `TRUNCATE` clears the entire table faster, but rollback behavior can differ.

```sql
DELETE FROM employees
WHERE id = 2;

DELETE FROM employees
WHERE department = 'Sales';

-- Remove all rows (table structure remains)
DELETE FROM employees;
-- or
TRUNCATE TABLE employees;
```

> Warning: `DELETE FROM employees;` with no `WHERE` deletes **all** rows.

---

## 4. Querying Data

Retrieve and shape result sets from one or more tables.

### 4.1 Selecting Data

`SELECT` reads data. Use `*` for all columns, or name only the columns you need.

```sql
SELECT * FROM employees;

SELECT name, department FROM employees;
```

### 4.2 Distinct Values

`DISTINCT` removes duplicate values so each value (or combination) appears only once.

```sql
SELECT DISTINCT department FROM employees;

SELECT DISTINCT department, salary FROM employees;
```

### 4.3 Sorting Results

`ORDER BY` sorts rows ascending (`ASC`, default) or descending (`DESC`).

```sql
SELECT name, salary
FROM employees
ORDER BY salary DESC;

-- Sort by multiple columns
SELECT name, department, salary
FROM employees
ORDER BY department ASC, salary DESC;
```

### 4.4 Filtering with WHERE

`WHERE` returns only rows that match a condition.

```sql
SELECT * FROM employees
WHERE department = 'Engineering';

SELECT name, salary FROM employees
WHERE salary >= 70000;

SELECT * FROM employees
WHERE department = 'Sales' AND salary > 60000;
```

Common operators: `=`, `<>`, `>`, `<`, `>=`, `<=`, `AND`, `OR`, `NOT`, `IN`, `BETWEEN`, `IS NULL`.

### 4.5 Pattern Matching with LIKE

`LIKE` matches patterns. `%` = any sequence of characters; `_` = exactly one character.

```sql
-- Starts with 'A'
SELECT * FROM employees WHERE name LIKE 'A%';

-- Ends with 'a'
SELECT * FROM employees WHERE name LIKE '%a';

-- Contains 'ar'
SELECT * FROM employees WHERE name LIKE '%ar%';

-- Exactly 3 characters, second is 'o' (e.g. Bob)
SELECT * FROM employees WHERE name LIKE '_o_';
```

### 4.6 String Functions

Complete PostgreSQL string function / operator set with short examples.

**Operators & SQL-standard style**

| Function / Operator                | Description                  | Example                                                    |
| ---------------------------------- | ---------------------------- | ---------------------------------------------------------- |
| `||`                               | Concatenate                  | `'Post' || 'greSQL'` → `PostgreSQL`                        |
| `^@`                               | Starts with                  | `'alphabet' ^@ 'alph'` → `t`                               |
| `BIT_LENGTH`                       | Length in bits               | `BIT_LENGTH('jose')` → `32`                                |
| `CHAR_LENGTH` / `CHARACTER_LENGTH` | Character length             | `CHAR_LENGTH('josé')` → `4`                                |
| `OCTET_LENGTH`                     | Length in bytes              | `OCTET_LENGTH('josé')` → `5`                               |
| `LOWER` / `UPPER`                  | Case convert                 | `LOWER('TOM')` → `tom`                                     |
| `INITCAP`                          | Title case words             | `INITCAP('hi THOMAS')` → `Hi Thomas`                       |
| `CASEFOLD`                         | Case fold (UTF8)             | `CASEFOLD('ß')`                                       |
| `LPAD` / `RPAD`                    | Pad to length                | `LPAD('hi', 5, 'xy')` → `xyxhi`                            |
| `LTRIM` / `RTRIM` / `BTRIM`        | Trim chars                   | `BTRIM('xyxtrimyyx', 'xyz')` → `trim`                      |
| `TRIM`                             | Trim leading/trailing/both   | `TRIM(BOTH 'x' FROM 'xTomx')` → `Tom`                      |
| `NORMALIZE`                        | Unicode normalize            | `NORMALIZE(U&'\0061\0308bc', NFC)`                         |
| `IS [NOT] NORMALIZED`              | Check normalization          | `U&'\0061\0308bc' IS NFD NORMALIZED`                       |
| `OVERLAY`                          | Replace slice (like STUFF)   | `OVERLAY('Txxxxas' PLACING 'hom' FROM 2 FOR 4)` → `Thomas` |
| `POSITION`                         | Find substring               | `POSITION('om' IN 'Thomas')` → `3`                         |
| `SUBSTRING`                        | Extract by position or regex | `SUBSTRING('Thomas' FROM 2 FOR 3)` → `hom`                 |
| `UNICODE_ASSIGNED`                 | All chars assigned Unicode   | `UNICODE_ASSIGNED('Hi')`                                   |

**Other string functions**

| Function                       | Description                    | Example                                       |
| ------------------------------ | ------------------------------ | --------------------------------------------- |
| `ASCII`                        | Code of first character        | `ASCII('x')` → `120`                          |
| `CHR`                          | Character from code            | `CHR(65)` → `A`                               |
| `CONCAT`                       | Concatenate (skips NULL)       | `CONCAT('a', NULL, 'b')` → `ab`               |
| `CONCAT_WS`                    | Concatenate with separator     | `CONCAT_WS(',', 'a', 'b')` → `a,b`            |
| `FORMAT`                       | sprintf-style format           | `FORMAT('Hello %s', 'World')`                 |
| `LEFT` / `RIGHT`               | Left/right `n` chars           | `LEFT('abcde', 2)` → `ab`                     |
| `LENGTH`                       | Character length               | `LENGTH('jose')` → `4`                        |
| `MD5`                          | MD5 hex hash                   | `MD5('abc')`                                  |
| `PARSE_IDENT`                  | Split qualified identifier     | `PARSE_IDENT('"SomeSchema".t')`               |
| `PG_CLIENT_ENCODING`           | Current client encoding        | `PG_CLIENT_ENCODING()`                        |
| `QUOTE_IDENT`                  | Quote as identifier            | `QUOTE_IDENT('Foo bar')`                      |
| `QUOTE_LITERAL`                | Quote as string literal        | `QUOTE_LITERAL(E'O\'Reilly')`                 |
| `QUOTE_NULLABLE`               | Quote literal or `NULL`        | `QUOTE_NULLABLE(NULL)` → `NULL`               |
| `REGEXP_COUNT`                 | Count regex matches            | `REGEXP_COUNT('123456789012', '\d\d\d')`      |
| `REGEXP_INSTR`                 | Position of regex match        | `REGEXP_INSTR('ABCDEF', 'c..', 1, 1, 0, 'i')` |
| `REGEXP_LIKE`                  | Regex match?                   | `REGEXP_LIKE('Hello', 'hello', 'i')`          |
| `REGEXP_MATCH`                 | First match groups             | `REGEXP_MATCH('foobarbaz', '(bar)')`          |
| `REGEXP_MATCHES`               | All match groups (set)         | `REGEXP_MATCHES('ba ba', 'ba', 'g')`          |
| `REGEXP_REPLACE`               | Replace via regex              | `REGEXP_REPLACE('Thomas', '.[mN]a.', 'M')`    |
| `REGEXP_SPLIT_TO_ARRAY`        | Split by regex → array         | `REGEXP_SPLIT_TO_ARRAY('a b', '\s+')`         |
| `REGEXP_SPLIT_TO_TABLE`        | Split by regex → rows          | `REGEXP_SPLIT_TO_TABLE('a b', '\s+')`         |
| `REGEXP_SUBSTR`                | Nth regex substring            | `REGEXP_SUBSTR('ABCDEF', 'c..', 1, 1, 'i')`   |
| `REPEAT`                       | Repeat string                  | `REPEAT('Pg', 4)` → `PgPgPgPg`                |
| `REPLACE`                      | Replace substring              | `REPLACE('abcdef', 'cd', 'XX')`               |
| `REVERSE`                      | Reverse characters             | `REVERSE('abcde')` → `edcba`                  |
| `SPLIT_PART`                   | Nth field by delimiter         | `SPLIT_PART('a,b,c', ',', 2)` → `b`           |
| `STARTS_WITH`                  | Prefix check                   | `STARTS_WITH('alphabet', 'alph')`             |
| `STRING_TO_ARRAY`              | Split → array                  | `STRING_TO_ARRAY('a,b,c', ',')`               |
| `STRING_TO_TABLE`              | Split → rows                   | `STRING_TO_TABLE('a,b,c', ',')`               |
| `STRPOS`                       | Substring position             | `STRPOS('high', 'ig')` → `2`                  |
| `SUBSTR`                       | Substring (start [, count])    | `SUBSTR('alphabet', 3, 2)` → `ph`             |
| `TO_ASCII`                     | Convert to ASCII               | `TO_ASCII('Karél')` → `Karel`                 |
| `TO_BIN` / `TO_HEX` / `TO_OCT` | Number → binary/hex/octal text | `TO_HEX(255)` → `ff`                          |
| `TRANSLATE`                    | Map characters 1:1             | `TRANSLATE('12345', '143', 'ax')` → `a2x5`    |
| `UNISTR`                       | Expand Unicode escapes         | `UNISTR('d\u0061ta')` → `data`                |
| `STRING_AGG`                   | Aggregate concatenate          | `STRING_AGG(name, ', ')`                      |

```sql
-- Length, case, trim, pad, extract
SELECT
  name,
  LENGTH(name) AS name_len,              -- LENGTH('jose') → 4
  CHAR_LENGTH(name) AS char_len,         -- CHAR_LENGTH('josé') → 4
  OCTET_LENGTH(name) AS byte_len,        -- OCTET_LENGTH('josé') → 5 (UTF8)
  BIT_LENGTH(name) AS bit_len,           -- BIT_LENGTH('jose') → 32
  UPPER(name) AS name_upper,             -- UPPER('tom') → 'TOM'
  LOWER(name) AS name_lower,             -- LOWER('TOM') → 'tom'
  INITCAP(name) AS name_initcap,         -- INITCAP('hi THOMAS') → 'Hi Thomas'
  TRIM(BOTH FROM name) AS name_trim,     -- TRIM(BOTH 'x' FROM 'xTomx') → 'Tom'
  BTRIM(name) AS name_btrim,             -- BTRIM('xyxtrimyyx', 'xyz') → 'trim'
  LPAD(name, 12, '.') AS name_lpad,      -- LPAD('hi', 5, 'xy') → 'xyxhi'
  RPAD(name, 12, '.') AS name_rpad,      -- RPAD('hi', 5, 'xy') → 'hixyx'
  LEFT(name, 3) AS left3,                -- LEFT('abcde', 2) → 'ab'
  RIGHT(name, 2) AS right2,              -- RIGHT('abcde', 2) → 'de'
  SUBSTRING(name FROM 1 FOR 4) AS first4,-- SUBSTRING('Thomas' FROM 2 FOR 3) → 'hom'
  SUBSTR(name, 1, 4) AS first4_alt       -- SUBSTR('alphabet', 3, 2) → 'ph'
FROM employees;

-- Concat, replace, search, reverse, repeat
SELECT
  name || ' - ' || department AS label,              -- 'Post' || 'greSQL' → 'PostgreSQL'
  CONCAT(name, ' - ', department) AS label_concat,   -- CONCAT('a', NULL, 'b') → 'ab'
  CONCAT_WS(' | ', name, department) AS label_ws,    -- CONCAT_WS(',', 'a', 'b') → 'a,b'
  FORMAT('%s works in %s', name, department) AS label_fmt, -- FORMAT('Hello %s', 'World') → 'Hello World'
  REPLACE(department, 'Engineering', 'Eng') AS dept_short, -- REPLACE('abcdef', 'cd', 'XX') → 'abXXef'
  TRANSLATE(name, 'aeiou', 'xxxxx') AS vowels_masked,-- TRANSLATE('12345', '143', 'ax') → 'a2x5'
  POSITION('a' IN name) AS pos_a,                    -- POSITION('om' IN 'Thomas') → 3
  STRPOS(name, 'a') AS pos_a_alt,                    -- STRPOS('high', 'ig') → 2
  REVERSE(name) AS name_rev,                         -- REVERSE('abcde') → 'edcba'
  REPEAT('*', 5) AS stars,                           -- REPEAT('Pg', 4) → 'PgPgPgPg'
  OVERLAY(name PLACING 'X' FROM 1 FOR 1) AS overlayed, -- OVERLAY('Txxxxas' PLACING 'hom' FROM 2 FOR 4) → 'Thomas'
  ASCII(LEFT(name, 1)) AS first_ascii,               -- ASCII('x') → 120
  CHR(65) AS letter_a,                               -- CHR(65) → 'A'
  STARTS_WITH(name, 'A') AS starts_a,                -- STARTS_WITH('alphabet', 'alph') → true
  name ^@ 'A' AS starts_a_op                         -- 'alphabet' ^@ 'alph' → true
FROM employees;

-- Split and aggregate
SELECT SPLIT_PART('Engineering,Sales,Product', ',', 2) AS second_part;
-- SPLIT_PART('a,b,c', ',', 2) → 'b'

SELECT UNNEST(STRING_TO_ARRAY('Engineering,Sales,Product', ',')) AS part;
-- STRING_TO_ARRAY('a,b,c', ',') → {a,b,c}

SELECT * FROM STRING_TO_TABLE('Engineering,Sales,Product', ',');
-- → Engineering | Sales | Product

SELECT department, STRING_AGG(name, ', ' ORDER BY name) AS names
FROM employees
GROUP BY department;
-- → Engineering: 'Alice, Carol'

-- Regex
SELECT
  REGEXP_LIKE(name, '^A', 'i') AS starts_a_ci,              -- REGEXP_LIKE('Hello', 'hello', 'i') → true
  REGEXP_REPLACE(name, '[aeiou]', '*', 'gi') AS no_vowels,  -- REGEXP_REPLACE('Thomas', '.[mN]a.', 'M') → 'ThM'
  REGEXP_MATCH(name, '(.)(.*)') AS first_groups,            -- REGEXP_MATCH('foobarbaz', '(bar)') → {bar}
  REGEXP_COUNT(department, '[aeiou]', 1, 'i') AS vowel_count -- REGEXP_COUNT('123456789012', '\d\d\d') → 4
FROM employees;

SELECT * FROM REGEXP_SPLIT_TO_TABLE('one two three', '\s+');
-- → one | two | three

-- Quoting, hashing, encoding helpers
SELECT
  QUOTE_IDENT(name) AS as_ident,       -- QUOTE_IDENT('Foo bar') → '"Foo bar"'
  QUOTE_LITERAL(name) AS as_literal,   -- QUOTE_LITERAL(E'O\'Reilly') → '''O''Reilly'''
  QUOTE_NULLABLE(NULL) AS as_null,     -- QUOTE_NULLABLE(NULL) → NULL
  MD5(name) AS name_md5,               -- MD5('abc') → '900150983cd24fb0d6963f7d28e17f72'
  TO_HEX(255) AS hex_ff,               -- TO_HEX(255) → 'ff'
  TO_BIN(10) AS bin_10,                -- TO_BIN(10) → '1010'
  TO_OCT(10) AS oct_10,                -- TO_OCT(10) → '12'
  PG_CLIENT_ENCODING() AS encoding;    -- PG_CLIENT_ENCODING() → 'UTF8'
```

---

## 5. Aggregation

Summarize multiple rows into a single result or per-group totals.

### 5.1 Aggregate Functions

Aggregates compute one value over a set of rows.

| Function  | Purpose                 |
| --------- | ----------------------- |
| `COUNT()` | Number of rows          |
| `SUM()`   | Total of numeric values |
| `AVG()`   | Average                 |
| `MIN()`   | Smallest value          |
| `MAX()`   | Largest value           |

```sql
SELECT COUNT(*) AS total_employees FROM employees;
SELECT SUM(salary) AS total_payroll FROM employees;
SELECT AVG(salary) AS avg_salary FROM employees;
SELECT MIN(salary), MAX(salary) FROM employees;
```

### 5.2 Grouping Data

`GROUP BY` runs aggregates per group. Use `HAVING` to filter those groups.

```sql
SELECT department, COUNT(*) AS emp_count, AVG(salary) AS avg_salary
FROM employees
GROUP BY department;

SELECT department, COUNT(*) AS emp_count
FROM employees
GROUP BY department
HAVING COUNT(*) > 1;
```

---

## 6. Utility Operations

Helpful operations beyond day-to-day CRUD.

### 6.1 Table Backup with SELECT INTO

Copy query results into a new table — useful for a quick backup.

```sql
CREATE TABLE employees_BK AS
SELECT * FROM employees;

-- Also valid (creates a new table)
SELECT * INTO employees_BK FROM employees;
```
