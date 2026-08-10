/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  compareOrdered,
  evaluateJqlDateFunction,
  isSupportedJqlDateFunction,
  parseComparable,
} from './jqlDateFunctions';

/*
Simple JQL Parser Documentation
===============================

This file implements a simple parser for a subset of Jira Query Language (JQL).

How it works:
-------------
- The parser tokenizes the input string, respecting quoted values and parentheses.
- It parses the tokens into an Abstract Syntax Tree (AST) supporting logical and comparison operations.
- The AST is compiled into a matching function that can be used to filter issues by their fields.
- The parser is case-insensitive for field names and operators.

Supported Syntax:
-----------------
- Comparison operators: =, !=, in, not in, ~ (contains), !~ (not contains), <, >, <=, >=
- Logical operators: AND, OR, NOT
- Parentheses for grouping: (...)
- Quoted field names and values (e.g., "Issue Size" = "Some Value")
- Special keywords: EMPTY, is, is not
- Array values for fields (e.g., labels in (bug, urgent))
- Date functions: now(), startOfDay/Week/Month/Year([inc]), endOfDay/Week/Month/Year([inc])
- Case-insensitive field names and operators

Not Supported:
--------------
- User/group/server functions (e.g., currentUser(), membersOf(), openSprints())
- ORDER BY, sorting, or subqueries
- Wildcards, LIKE, regex matching
- Nested property access (e.g., parent.field)
- Comments or multiline queries

Examples of Supported JQL:
--------------------------
- project = THF
- status != Done
- labels in (bug, urgent)
- labels not in (feature, enhancement)
- "Issue Size" = "Large"
- Field1 = value AND Field2 != other
- (Field1 = a OR Field2 = b) AND Field2 != c
- Field1 is EMPTY
- Field1 is not EMPTY
- labels = bug
- project = THF AND "Issue Size" is not EMPTY
- summary ~ win
- summary !~ run
- description ~ "full screen"
- duedate < now()
- created >= startOfDay("-7d")
- "Story Points" > 13

Examples of NOT Supported JQL:
------------------------------
- assignee = currentUser()              // User functions not supported
- sprint in openSprints()               // Server-side functions not supported
- ORDER BY created DESC                 // Sorting not supported
- parent.status = Done                  // Nested property access not supported
- Field1 = value with spaces            // Value with spaces must be quoted
- Field1 not in a                      // Missing parentheses after 'in'

Error Handling:
---------------
- The parser throws clear errors for unsupported syntax, missing quotes, or unexpected tokens.
- Example: Field1 = value with spaces → Error: Did you forget to quote the value?
- Example: Field1 not in a → Error: Expected ( after in

*/
// Simple JQL parser for basic expressions
// Supported: =, !=, <, >, <=, >=, in, not in, AND, OR, NOT, EMPTY, is, date functions, parentheses

export type JqlMatchFn = (getFieldValue: (fieldName: string) => any) => boolean;

export type ParseJqlOptions = {
  /** Clock for now() and startOf/endOf period functions. Defaults to `() => new Date()`. Inject in tests. */
  now?: () => Date;
};

export type JqlFunctionRef = { name: string; args: string[] };

// Exported types for AST and evaluation result
export type JqlAstNode =
  | { type: 'AND' | 'OR'; left: JqlAstNode; right: JqlAstNode }
  | { type: 'NOT'; expr: JqlAstNode }
  | {
      type: 'condition';
      field: string;
      op: string;
      value?: string;
      values?: string[];
      fn?: JqlFunctionRef;
    };

export type JqlAstResult =
  | { type: 'AND' | 'OR'; left: JqlAstResult; right: JqlAstResult; matched: boolean }
  | { type: 'NOT'; expr: JqlAstResult; matched: boolean }
  | {
      type: 'condition';
      field: string;
      op: string;
      value?: string;
      values?: string[];
      fn?: JqlFunctionRef;
      matched: boolean;
      actualValue?: unknown; // Actual field value from the issue for debugging
    };

const ORDERED_OPS = new Set(['<', '<=', '>', '>=']);

// Tokenizer that respects quoted strings and tracks if token was quoted.
// Recognises comparison operators (!=, =, !~, ~) as separate tokens even when not
// separated by whitespace, so user input like `project=TRPA AND status=Done`
// (no spaces around `=`) still parses correctly. Real Jira tolerates this; the
// previous implementation required spaces and would treat `project=TRPA` as a
// single field token, then choke on the next word as an "Unknown operator".
function tokenize(jql: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < jql.length) {
    if (jql[i].match(/\s/)) {
      i++;
      continue;
    }
    if (jql[i] === '"') {
      let j = i + 1;
      while (j < jql.length && jql[j] !== '"') j++;
      if (j === jql.length) throw new Error('Unclosed quote');
      tokens.push(jql.slice(i, j + 1));
      i = j + 1;
      continue;
    }
    if (jql[i] === '(' || jql[i] === ')' || jql[i] === ',') {
      tokens.push(jql[i]);
      i++;
      continue;
    }
    // Two-char operators take priority over one-char prefixes.
    if (
      (jql[i] === '!' && (jql[i + 1] === '=' || jql[i + 1] === '~')) ||
      (jql[i] === '<' && jql[i + 1] === '=') ||
      (jql[i] === '>' && jql[i + 1] === '=')
    ) {
      tokens.push(jql.slice(i, i + 2));
      i += 2;
      continue;
    }
    if (jql[i] === '=' || jql[i] === '~' || jql[i] === '<' || jql[i] === '>') {
      tokens.push(jql[i]);
      i++;
      continue;
    }
    // word — terminate on whitespace, parentheses, comma, or any operator char
    let j = i;
    while (
      j < jql.length &&
      !jql[j].match(/[\s(),=~<>]/) &&
      !(jql[j] === '!' && (jql[j + 1] === '=' || jql[j + 1] === '~'))
    ) {
      j++;
    }
    tokens.push(jql.slice(i, j));
    i = j;
  }
  return tokens;
}

// Helper to check if a token is a keyword (case-insensitive)
function isKeyword(token: string, keyword: string) {
  return token && token.toUpperCase() === keyword.toUpperCase();
}

// Helper to check if a token is quoted
function isQuoted(token: string) {
  return token.length >= 2 && token[0] === '"' && token[token.length - 1] === '"';
}

// Parser
function parseTokens(tokens: string[]): any {
  let pos = 0;

  function parseExpression(): any {
    let node = parseTerm();
    while (isKeyword(tokens[pos], 'AND') || isKeyword(tokens[pos], 'OR')) {
      const op = tokens[pos++].toUpperCase();
      const right = parseTerm();
      node = { type: op, left: node, right };
    }
    return node;
  }

  function parseTerm(): any {
    if (isKeyword(tokens[pos], 'NOT')) {
      pos++;
      return { type: 'NOT', expr: parseTerm() };
    }
    if (tokens[pos] === '(') {
      pos++;
      const expr = parseExpression();
      if (tokens[pos] !== ')') throw new Error('Expected )');
      pos++;
      return expr;
    }
    const condition = parseCondition();
    const currentToken = tokens[pos];
    if (
      currentToken !== undefined &&
      !isKeyword(currentToken, 'AND') &&
      !isKeyword(currentToken, 'OR') &&
      !isKeyword(currentToken, ')')
    ) {
      throw new Error(
        `Expected AND, OR, "," or ) expected, but got "${currentToken}". Did you forget to quote the value?`
      );
    }
    return condition;
  }

  function parseRhs(): { value?: string; fn?: JqlFunctionRef } {
    const token = tokens[pos];
    if (typeof token === 'undefined') throw new Error('Expecting value, but got END');

    // functionCall(...)
    if (tokens[pos + 1] === '(') {
      const name = token.toLowerCase();
      pos += 2; // name + '('
      const args: string[] = [];
      if (tokens[pos] !== ')') {
        while (true) {
          const argTok = tokens[pos++];
          if (typeof argTok === 'undefined') throw new Error('Expecting function argument or ), but got END');
          args.push(stripQuotes(argTok));
          if (tokens[pos] === ',') {
            pos++;
            continue;
          }
          break;
        }
      }
      if (tokens[pos] !== ')') throw new Error('Expected ) after function arguments');
      pos++;
      if (!isSupportedJqlDateFunction(name)) {
        throw new Error(`Unsupported function: ${name}()`);
      }
      return { fn: { name, args } };
    }

    pos++;
    return { value: stripQuotes(token) };
  }

  function parseCondition(): any {
    let field = tokens[pos++];
    if (!field) throw new Error('Expecting field name, but got END');

    field = stripQuotes(field).toLowerCase();
    let op = tokens[pos++];
    if (!op) throw new Error('Expecting operator, but got END');
    switch (true) {
      case isKeyword(op, 'is'): {
        if (isKeyword(tokens[pos], 'not')) {
          pos++;
          let value = tokens[pos++];
          if (value.includes(' ') && !isQuoted(value)) {
            throw new Error(`Value with spaces must be quoted: ${value}`);
          }
          if (typeof value === 'undefined') throw new Error('Expecting value, but got END');
          value = stripQuotes(value);
          return { type: 'condition', field, op: 'is not', value };
        }
        let value = tokens[pos++];
        if (value.includes(' ') && !isQuoted(value)) {
          throw new Error(`Value with spaces must be quoted: ${value}`);
        }
        if (typeof value === 'undefined') throw new Error('Expecting value, but got END');
        value = stripQuotes(value);
        return { type: 'condition', field, op: '=', value };
      }
      case isKeyword(op, 'not'): {
        const nextToken = tokens[pos];
        if (nextToken != 'in') {
          throw new Error(`Expected in to get "not in", but got "${nextToken}"`);
        }
        pos++;
        op = 'not in';
      }
      // eslint-disable-next-line no-fallthrough
      case isKeyword(op, 'in') || op.toLowerCase() === 'not in': {
        if (tokens[pos++] !== '(') throw new Error('Expected ( after in');
        const values = [];
        while (tokens[pos] !== ')') {
          let val = tokens[pos++];
          if (val.endsWith(',')) val = val.slice(0, -1);
          if (val.includes(' ') && !isQuoted(val)) {
            throw new Error(`Value with spaces must be quoted: ${val}`);
          }
          values.push(stripQuotes(val));
          if (tokens[pos] === ',') pos++;
        }
        pos++; // skip ')'
        return { type: 'condition', field, op: op.toLowerCase(), values };
      }
      case op === '~' || op === '!~': {
        let value = tokens[pos++];
        if (typeof value === 'undefined') throw new Error('Expecting value, but got END');
        value = stripQuotes(value);
        return { type: 'condition', field, op, value };
      }
      case isKeyword(op, '='):
      case isKeyword(op, '!='):
      case op === '<' || op === '<=' || op === '>' || op === '>=': {
        const rhs = parseRhs();
        return {
          type: 'condition',
          field,
          op: op.toLowerCase(),
          ...(rhs.fn ? { fn: rhs.fn } : { value: rhs.value }),
        };
      }
      default: {
        throw new Error(`Unknown operator: "${op}". Did you forget to quote the field name?`);
      }
    }
  }

  return parseExpression();
}

function stripQuotes(val: string) {
  return val.replace(/^"|"$/g, '');
}

function isEmpty(val: any): boolean {
  return (
    val === undefined ||
    val === null ||
    (typeof val === 'string' && val.trim() === '') ||
    (Array.isArray(val) && val.length === 0)
  );
}

// Helper to handle array or single value
function anyMatch(val: any, predicate: (v: any) => boolean): boolean {
  if (Array.isArray(val)) {
    return val.some(predicate);
  }
  return predicate(val);
}

function allMatch(val: any, predicate: (v: any) => boolean): boolean {
  if (Array.isArray(val)) {
    return val.every(predicate);
  }
  return predicate(val);
}

function isArrayEmptyOrAll(val: any, predicate: (v: any) => boolean): boolean {
  if (Array.isArray(val)) {
    return val.length === 0 || val.every(predicate);
  }
  return predicate(val);
}

function resolveRhs(node: { value?: string; fn?: JqlFunctionRef }, getNow: () => Date): number | string | undefined {
  if (node.fn) {
    return evaluateJqlDateFunction(node.fn.name, node.fn.args, getNow());
  }
  return node.value;
}

function matchCondition(
  node: { field: string; op: string; value?: string; values?: string[]; fn?: JqlFunctionRef },
  getFieldValue: (fieldName: string) => any,
  getNow: () => Date
): boolean {
  const field = node.field.toLowerCase();
  const actual = getFieldValue(field);

  if (node.value === 'EMPTY') {
    if (node.op === '=') return isArrayEmptyOrAll(actual, isEmpty);
    if (node.op === '!=') return !isArrayEmptyOrAll(actual, isEmpty);
    if (node.op === 'is not') return !isArrayEmptyOrAll(actual, isEmpty);
  }

  if (ORDERED_OPS.has(node.op) || node.fn) {
    const rhs = resolveRhs(node, getNow);
    if (rhs === undefined) return false;
    if (ORDERED_OPS.has(node.op)) {
      return anyMatch(actual, v => compareOrdered(v, node.op as '<' | '<=' | '>' | '>=', rhs));
    }
    if (node.op === '=') {
      return anyMatch(actual, v => {
        const l = parseComparable(v);
        const r = typeof rhs === 'number' ? rhs : parseComparable(rhs);
        return l !== null && r !== null && l === r;
      });
    }
    if (node.op === '!=') {
      return allMatch(actual, v => {
        const l = parseComparable(v);
        const r = typeof rhs === 'number' ? rhs : parseComparable(rhs);
        return l === null || r === null || l !== r;
      });
    }
  }

  if (node.op === '=') {
    return anyMatch(actual, v => v == node.value);
  }
  if (node.op === '!=') {
    return allMatch(actual, v => v != node.value);
  }
  if (node.op === 'in') {
    return anyMatch(actual, v => node.values!.includes(v));
  }
  if (node.op === 'not in') {
    return allMatch(actual, v => !node.values!.includes(v));
  }
  if (node.op === '~') {
    const result = anyMatch(actual, v => {
      if (typeof v === 'string' || typeof v === 'number') {
        return v.toString().includes(node.value ?? '');
      }
      if (Array.isArray(v)) {
        return v.some(item =>
          typeof item === 'string' || typeof item === 'number' ? item.toString().includes(node.value ?? '') : false
        );
      }
      return false;
    });
    return result === undefined ? false : result;
  }
  if (node.op === '!~') {
    const result = allMatch(actual, v => {
      if (typeof v === 'string' || typeof v === 'number') {
        return !v.toString().includes(node.value ?? '');
      }
      if (Array.isArray(v)) {
        return v.every(item =>
          typeof item === 'string' || typeof item === 'number' ? !item.toString().includes(node.value ?? '') : true
        );
      }
      return true;
    });
    return result === undefined ? true : result;
  }
  throw new Error(`Unknown operator in condition: ${node.op}`);
}

// Compiler
function compile(node: any, getNow: () => Date): JqlMatchFn {
  if (!node) return () => true;

  if (node.type === 'AND') {
    const l = compile(node.left, getNow);
    const r = compile(node.right, getNow);
    return getFieldValue => l(getFieldValue) && r(getFieldValue);
  }
  if (node.type === 'OR') {
    const l = compile(node.left, getNow);
    const r = compile(node.right, getNow);
    return getFieldValue => l(getFieldValue) || r(getFieldValue);
  }
  if (node.type === 'NOT') {
    const expr = compile(node.expr, getNow);
    return getFieldValue => !expr(getFieldValue);
  }
  if (node.type === 'condition') {
    return getFieldValue => matchCondition(node, getFieldValue, getNow);
  }
  throw new Error(`Unknown node: ${JSON.stringify(node)}`);
}

export function parseJql(jql: string, options?: ParseJqlOptions): JqlMatchFn {
  const tokens = tokenize(jql);
  const ast = parseTokens(tokens);
  const getNow = options?.now ?? (() => new Date());

  return compile(ast, getNow);
}

// Export tokenizer
export { tokenize };

// Export AST parser
export function parseJqlAst(jql: string): JqlAstNode {
  const tokens = tokenize(jql);
  return parseTokens(tokens);
}

// Evaluate AST and return result tree
export function evaluateJqlAst(
  ast: JqlAstNode,
  getFieldValue: (fieldName: string) => any,
  options?: ParseJqlOptions
): JqlAstResult {
  const getNow = options?.now ?? (() => new Date());
  if (!ast) return { type: 'condition', field: '', op: '', matched: true };
  if (ast.type === 'AND' || ast.type === 'OR') {
    const left = evaluateJqlAst(ast.left, getFieldValue, options);
    const right = evaluateJqlAst(ast.right, getFieldValue, options);
    const matched = ast.type === 'AND' ? left.matched && right.matched : left.matched || right.matched;
    return { type: ast.type, left, right, matched };
  }
  if (ast.type === 'NOT') {
    const expr = evaluateJqlAst(ast.expr, getFieldValue, options);
    return { type: 'NOT', expr, matched: !expr.matched };
  }
  if (ast.type === 'condition') {
    const field = ast.field.toLowerCase();
    const actualValue = getFieldValue(field);
    const matched = matchCondition(ast, getFieldValue, getNow);
    return { ...ast, matched, actualValue, type: 'condition' };
  }
  throw new Error(`Unknown node: ${JSON.stringify(ast)}`);
}
