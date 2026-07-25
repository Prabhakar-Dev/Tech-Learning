# MSSQL Basics

A short reference for common SQL operations on **Microsoft SQL Server (T-SQL)** — from schema design to querying, aggregating, and modifying data.

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

Core syntax conventions used throughout T-SQL.

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

-- Switch context to the database
USE company_db;
GO

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

Auto-increment generates the next integer ID automatically on insert using `IDENTITY`.

```sql
CREATE TABLE employees (
  id INT IDENTITY(1, 1) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(50)
);

INSERT INTO employees (name, department)
VALUES ('Alice', 'Engineering');
-- id is set automatically (e.g. 1)
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

Complete T-SQL string function set with short examples.

| Function        | Description                                | Example                                   |
| --------------- | ------------------------------------------ | ----------------------------------------- |
| `ASCII`         | ASCII code of first character              | `ASCII('A')` → `65`                       |
| `CHAR`          | Character for ASCII code                   | `CHAR(65)` → `A`                          |
| `CHARINDEX`     | Start position of substring                | `CHARINDEX('om', 'Thomas')` → `3`         |
| `CONCAT`        | Concatenate values (NULLs → empty)         | `CONCAT('A', NULL, 'B')` → `AB`           |
| `CONCAT_WS`     | Concatenate with separator                 | `CONCAT_WS('-', 'a', 'b')` → `a-b`        |
| `DATALENGTH`    | Length in bytes                            | `DATALENGTH(N'Hi')` → `4`                 |
| `DIFFERENCE`    | SOUNDEX similarity (0–4)                   | `DIFFERENCE('Green', 'Greene')`           |
| `FORMAT`        | Format value as string                     | `FORMAT(1234.5, 'N2')`                    |
| `LEFT`          | Leftmost `n` characters                    | `LEFT('Alice', 2)` → `Al`                 |
| `LEN`           | Character length (trailing spaces ignored) | `LEN('Hi ')` → `2`                        |
| `LOWER`         | Lowercase                                  | `LOWER('TOM')` → `tom`                    |
| `LTRIM`         | Remove leading spaces (or chars)           | `LTRIM(' Hi')` → `Hi`                     |
| `NCHAR`         | Unicode character for code point           | `NCHAR(65)` → `A`                         |
| `PATINDEX`      | Position of pattern (`%` wildcards)        | `PATINDEX('%om%', 'Thomas')` → `3`        |
| `QUOTENAME`     | Delimit as valid identifier                | `QUOTENAME('My Table')` → `[My Table]`    |
| `REPLACE`       | Replace all occurrences                    | `REPLACE('ab', 'a', 'x')` → `xb`          |
| `REPLICATE`     | Repeat string `n` times                    | `REPLICATE('x', 3)` → `xxx`               |
| `REVERSE`       | Reverse characters                         | `REVERSE('abc')` → `cba`                  |
| `RIGHT`         | Rightmost `n` characters                   | `RIGHT('Alice', 2)` → `ce`                |
| `RTRIM`         | Remove trailing spaces (or chars)          | `RTRIM('Hi ')` → `Hi`                     |
| `SOUNDEX`       | Phonetic code                              | `SOUNDEX('Smith')`                        |
| `SPACE`         | String of `n` spaces                       | `SPACE(3)`                                |
| `STR`           | Number → string                            | `STR(123.45, 6, 1)`                       |
| `STRING_AGG`    | Aggregate concatenate                      | `STRING_AGG(name, ', ')`                  |
| `STRING_ESCAPE` | Escape for JSON/etc.                       | `STRING_ESCAPE('a\b', 'json')`            |
| `STRING_SPLIT`  | Split to rows                              | `STRING_SPLIT('a,b,c', ',')`              |
| `STUFF`         | Delete + insert at position                | `STUFF('abcdef', 2, 3, 'xyz')` → `axyzef` |
| `SUBSTRING`     | Extract substring                          | `SUBSTRING('Thomas', 2, 3)` → `hom`       |
| `TRANSLATE`     | Map characters 1:1                         | `TRANSLATE('2*[3+4]', '[]', '()')`        |
| `TRIM`          | Trim both ends                             | `TRIM(' Hi ')` → `Hi`                     |
| `UNICODE`       | Unicode of first character                 | `UNICODE(N'Å')`                           |
| `UPPER`         | Uppercase                                  | `UPPER('tom')` → `TOM`                    |

```sql
-- Length, case, trim, extract
SELECT
  name,
  LEN(name) AS name_len,                    -- LEN('Hi ') → 2
  DATALENGTH(name) AS name_bytes,           -- DATALENGTH('Hi') → 2; N'Hi' → 4
  UPPER(name) AS name_upper,                -- UPPER('tom') → 'TOM'
  LOWER(name) AS name_lower,                -- LOWER('TOM') → 'tom'
  LTRIM(RTRIM(name)) AS name_trimmed,       -- LTRIM(RTRIM(' Hi ')) → 'Hi'
  TRIM(name) AS name_trim,                  -- TRIM(' Hi ') → 'Hi'
  LEFT(name, 3) AS left3,                   -- LEFT('Alice', 3) → 'Ali'
  RIGHT(name, 2) AS right2,                 -- RIGHT('Alice', 2) → 'ce'
  SUBSTRING(name, 1, 4) AS first4           -- SUBSTRING('Thomas', 2, 3) → 'hom'
FROM employees;

-- Concat, replace, search, reverse, replicate
SELECT
  CONCAT(name, ' - ', department) AS label,           -- CONCAT('A', NULL, 'B') → 'AB'
  CONCAT_WS(' | ', name, department) AS label_ws,     -- CONCAT_WS('-', 'a', 'b') → 'a-b'
  REPLACE(department, 'Engineering', 'Eng') AS dept_short, -- REPLACE('abab', 'a', 'x') → 'xbxb'
  TRANSLATE(name, 'aeiou', 'xxxxx') AS vowels_masked, -- TRANSLATE('2*[3]', '[]', '()') → '2*(3)'
  CHARINDEX('a', name) AS pos_a,                      -- CHARINDEX('om', 'Thomas') → 3
  PATINDEX('%ing%', department) AS pos_ing,           -- PATINDEX('%om%', 'Thomas') → 3
  REVERSE(name) AS name_rev,                          -- REVERSE('abc') → 'cba'
  REPLICATE('*', 5) AS stars,                         -- REPLICATE('x', 3) → 'xxx'
  STUFF(name, 1, 1, UPPER(LEFT(name, 1))) AS capped,  -- STUFF('abcdef', 2, 3, 'xyz') → 'axyzef'
  ASCII(LEFT(name, 1)) AS first_ascii,                -- ASCII('A') → 65
  CHAR(65) AS letter_a,                               -- CHAR(65) → 'A'
  SPACE(2) AS two_spaces,                             -- SPACE(3) → '   '
  STR(salary, 10, 2) AS salary_str,                   -- STR(123.45, 6, 1) → ' 123.5'
  FORMAT(salary, 'C', 'en-US') AS salary_fmt          -- FORMAT(1234.5, 'N2') → '1,234.50'
FROM employees;

-- Split and aggregate
SELECT value AS part
FROM STRING_SPLIT('Engineering,Sales,Product', ',');
-- → Engineering | Sales | Product

SELECT
  department,
  STRING_AGG(name, ', ') WITHIN GROUP (ORDER BY name) AS names
FROM employees
GROUP BY department;
-- → Engineering: 'Alice, Carol'

-- Soundex / difference / quotename / escape
SELECT
  SOUNDEX(name) AS sound,                 -- SOUNDEX('Smith') → 'S530'
  DIFFERENCE(name, 'Alice') AS like_alice, -- DIFFERENCE('Green', 'Greene') → 4
  QUOTENAME(name) AS quoted_id,           -- QUOTENAME('My Table') → '[My Table]'
  STRING_ESCAPE(name, 'json') AS json_safe -- STRING_ESCAPE('a\b', 'json') → 'a\\b'
FROM employees;
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
SELECT * INTO employees_BK FROM employees;
```
