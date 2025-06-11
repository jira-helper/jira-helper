// Simple JQL parser for basic expressions
// Supported: =, !=, in, not in, AND, OR, NOT, EMPTY, is, parentheses

export type JqlMatchFn = (getFieldValue: (fieldName: string) => any) => boolean;

// Exported types for AST and evaluation result
export type JqlAstNode =
  | { type: 'AND' | 'OR'; left: JqlAstNode; right: JqlAstNode }
  | { type: 'NOT'; expr: JqlAstNode }
  | { type: 'condition'; field: string; op: string; value?: string; values?: string[] };

export type JqlAstResult =
  | { type: 'AND' | 'OR'; left: JqlAstResult; right: JqlAstResult; matched: boolean }
  | { type: 'NOT'; expr: JqlAstResult; matched: boolean }
  | { type: 'condition'; field: string; op: string; value?: string; values?: string[]; matched: boolean };

// Tokenizer that respects quoted strings and tracks if token was quoted
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
    if (jql[i] === '(' || jql[i] === ')') {
      tokens.push(jql[i]);
      i++;
      continue;
    }
    // word
    let j = i;
    while (j < jql.length && !jql[j].match(/[\s()]/)) j++;
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
    return parseCondition();
  }

  function parseCondition(): any {
    let field = tokens[pos++];
    // Enforce quoting for field names with spaces
    if (field.includes(' ') && !isQuoted(field)) {
      throw new Error(`Field name with spaces must be quoted: ${field}`);
    }
    field = stripQuotes(field).toLowerCase();
    let op = tokens[pos++];
    // Normalize operator keywords
    if (isKeyword(op, 'is')) {
      if (isKeyword(tokens[pos], 'not')) {
        pos++;
        let value = tokens[pos++];
        if (value.includes(' ') && !isQuoted(value)) {
          throw new Error(`Value with spaces must be quoted: ${value}`);
        }
        value = stripQuotes(value);
        return { type: 'condition', field, op: 'is not', value };
      }
      let value = tokens[pos++];
      if (value.includes(' ') && !isQuoted(value)) {
        throw new Error(`Value with spaces must be quoted: ${value}`);
      }
      value = stripQuotes(value);
      return { type: 'condition', field, op: '=', value };
    }
    if (isKeyword(op, 'not')) {
      op += ` ${tokens[pos++]}`; // 'not in'
    }
    if (isKeyword(op, 'in') || op.toLowerCase() === 'not in') {
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
    // Enforce quoting for value with spaces
    let value = tokens[pos++];
    if (value && value.includes(' ') && !isQuoted(value)) {
      throw new Error(`Value with spaces must be quoted: ${value}`);
    }
    value = stripQuotes(value);
    return { type: 'condition', field, op: op.toLowerCase(), value };
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

// Compiler
function compile(node: any): JqlMatchFn {
  if (!node) return () => true;

  if (node.type === 'AND') {
    const l = compile(node.left);
    const r = compile(node.right);
    return getFieldValue => l(getFieldValue) && r(getFieldValue);
  }
  if (node.type === 'OR') {
    const l = compile(node.left);
    const r = compile(node.right);
    return getFieldValue => l(getFieldValue) || r(getFieldValue);
  }
  if (node.type === 'NOT') {
    const expr = compile(node.expr);
    return getFieldValue => !expr(getFieldValue);
  }
  if (node.type === 'condition') {
    // Always use lowercased field names for case-insensitive matching
    const field = node.field.toLowerCase();
    if (node.value === 'EMPTY') {
      if (node.op === '=') {
        return getFieldValue => isArrayEmptyOrAll(getFieldValue(field), isEmpty);
      }
      if (node.op === '!=') {
        return getFieldValue => !isArrayEmptyOrAll(getFieldValue(field), isEmpty);
      }
      if (node.op === 'is not') {
        return getFieldValue => !isArrayEmptyOrAll(getFieldValue(field), isEmpty);
      }
    }
    if (node.op === '=') {
      return getFieldValue => anyMatch(getFieldValue(field), v => v == node.value);
    }
    if (node.op === '!=') {
      return getFieldValue => allMatch(getFieldValue(field), v => v != node.value);
    }
    if (node.op === 'in') {
      return getFieldValue => anyMatch(getFieldValue(field), v => node.values.includes(v));
    }
    if (node.op === 'not in') {
      return getFieldValue => allMatch(getFieldValue(field), v => !node.values.includes(v));
    }
  }
  throw new Error(`Unknown node: ${JSON.stringify(node)}`);
}

export function parseJql(jql: string): JqlMatchFn {
  const tokens = tokenize(jql);
  const ast = parseTokens(tokens);
  return compile(ast);
}

// Export tokenizer
export { tokenize };

// Export AST parser
export function parseJqlAst(jql: string): JqlAstNode {
  const tokens = tokenize(jql);
  return parseTokens(tokens);
}

// Evaluate AST and return result tree
export function evaluateJqlAst(ast: JqlAstNode, getFieldValue: (fieldName: string) => any): JqlAstResult {
  if (!ast) return { type: 'condition', field: '', op: '', matched: true };
  if (ast.type === 'AND' || ast.type === 'OR') {
    const left = evaluateJqlAst(ast.left, getFieldValue);
    const right = evaluateJqlAst(ast.right, getFieldValue);
    const matched = ast.type === 'AND' ? left.matched && right.matched : left.matched || right.matched;
    return { type: ast.type, left, right, matched };
  }
  if (ast.type === 'NOT') {
    const expr = evaluateJqlAst(ast.expr, getFieldValue);
    return { type: 'NOT', expr, matched: !expr.matched };
  }
  if (ast.type === 'condition') {
    // Always use lowercased field names for case-insensitive matching
    const field = ast.field.toLowerCase();
    let matched = false;
    if (ast.value === 'EMPTY') {
      if (ast.op === '=') {
        matched = isArrayEmptyOrAll(getFieldValue(field), isEmpty);
      } else if (ast.op === '!=') {
        matched = !isArrayEmptyOrAll(getFieldValue(field), isEmpty);
      } else if (ast.op === 'is not') {
        matched = !isArrayEmptyOrAll(getFieldValue(field), isEmpty);
      }
    } else if (ast.op === '=') {
      matched = anyMatch(getFieldValue(field), v => v == ast.value);
    } else if (ast.op === '!=') {
      matched = allMatch(getFieldValue(field), v => v != ast.value);
    } else if (ast.op === 'in') {
      matched = anyMatch(getFieldValue(field), v => ast.values && ast.values.includes(v));
    } else if (ast.op === 'not in') {
      matched = allMatch(getFieldValue(field), v => ast.values && !ast.values.includes(v));
    }
    return { ...ast, matched, type: 'condition' };
  }
  throw new Error(`Unknown node: ${JSON.stringify(ast)}`);
}
