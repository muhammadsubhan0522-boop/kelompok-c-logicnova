/**
 * parser.js
 * ---------
 * Recursive-descent parser yang mengubah token menjadi Abstract Syntax Tree (AST).
 *
 * Tata bahasa (grammar) — urutan precedence dari terendah ke tertinggi:
 *
 *   expression  → biconditional
 *   biconditional → implication (IFF implication)*
 *   implication   → xor (IMPLIES xor)*          (right-associative)
 *   xor           → disjunction (XOR disjunction)*
 *   disjunction   → conjunction (OR conjunction)*
 *   conjunction   → negation (AND negation)*
 *   negation      → NOT negation | primary
 *   primary       → VAR | LPAREN expression RPAREN
 *
 * Node AST:
 *   { type: 'BINARY', op, left, right }
 *   { type: 'UNARY',  op, operand      }
 *   { type: 'VAR',    name             }
 *   { type: 'BOOL',   value: true|false }
 */

class Parser {
  /**
   * @param {{ type: string, value: string }[]} tokens
   */
  constructor(tokens) {
    this.tokens  = tokens;
    this.current = 0;
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  /** Token saat ini tanpa mengonsumsi. */
  peek() {
    return this.tokens[this.current] || null;
  }

  /** Konsumsi token berikutnya. */
  consume() {
    return this.tokens[this.current++];
  }

  /** Cek apakah token saat ini cocok dengan tipe yang diberikan. */
  check(type) {
    const t = this.peek();
    return t !== null && t.type === type;
  }

  /** Konsumsi token hanya jika tipenya cocok; kembalikan boolean. */
  match(...types) {
    for (const type of types) {
      if (this.check(type)) { this.consume(); return true; }
    }
    return false;
  }

  /** Pastikan token saat ini bertipe `type`, konsumsi atau lempar error. */
  expect(type) {
    if (this.check(type)) return this.consume();
    const got = this.peek() ? `'${this.peek().value}'` : 'akhir input';
    throw new Error(`Diharapkan ${type}, tapi ditemukan ${got}`);
  }

  // ── Grammar rules ────────────────────────────────────────────────────────────

  parse() {
    const node = this.parseExpression();
    if (this.peek() !== null) {
      throw new Error(`Token tidak terduga: '${this.peek().value}'`);
    }
    return node;
  }

  /** expression → biconditional */
  parseExpression() {
    return this.parseBiconditional();
  }

  /** biconditional → implication (IFF implication)* */
  parseBiconditional() {
    let left = this.parseImplication();

    while (this.check(TokenType.IFF)) {
      this.consume();
      const right = this.parseImplication();
      left = { type: 'BINARY', op: 'IFF', left, right };
    }

    return left;
  }

  /**
   * implication → xor (IMPLIES xor)*
   * IMPLIES bersifat right-associative: p→q→r ≡ p→(q→r)
   */
  parseImplication() {
    const left = this.parseXor();

    if (this.check(TokenType.IMPLIES)) {
      this.consume();
      const right = this.parseImplication(); // rekursi ke kanan
      return { type: 'BINARY', op: 'IMPLIES', left, right };
    }

    return left;
  }

  /** xor → disjunction (XOR disjunction)* */
  parseXor() {
    let left = this.parseDisjunction();

    while (this.check(TokenType.XOR)) {
      this.consume();
      const right = this.parseDisjunction();
      left = { type: 'BINARY', op: 'XOR', left, right };
    }

    return left;
  }

  /** disjunction → conjunction (OR conjunction)* */
  parseDisjunction() {
    let left = this.parseConjunction();

    while (this.check(TokenType.OR)) {
      this.consume();
      const right = this.parseConjunction();
      left = { type: 'BINARY', op: 'OR', left, right };
    }

    return left;
  }

  /** conjunction → negation (AND negation)* */
  parseConjunction() {
    let left = this.parseNegation();

    while (this.check(TokenType.AND)) {
      this.consume();
      const right = this.parseNegation();
      left = { type: 'BINARY', op: 'AND', left, right };
    }

    return left;
  }

  /** negation → NOT negation | primary */
  parseNegation() {
    if (this.check(TokenType.NOT)) {
      this.consume();
      const operand = this.parseNegation();
      return { type: 'UNARY', op: 'NOT', operand };
    }
    return this.parsePrimary();
  }

  /** primary → VAR | LPAREN expression RPAREN */
  parsePrimary() {
    const token = this.peek();

    if (token === null) {
      throw new Error('Ekspresi tidak lengkap — input tiba-tiba berakhir.');
    }

    if (token.type === TokenType.VAR) {
      this.consume();
      if (token.value === 'TRUE')  return { type: 'BOOL', value: true  };
      if (token.value === 'FALSE') return { type: 'BOOL', value: false };
      return { type: 'VAR', name: token.value };
    }

    if (token.type === TokenType.LPAREN) {
      this.consume(); // '('
      const inner = this.parseExpression();
      this.expect(TokenType.RPAREN); // ')'
      return inner;
    }

    throw new Error(`Token tidak terduga: '${token.value}'`);
  }
}

/**
 * Entry point: parse string ekspresi menjadi AST.
 * @param {string} input
 * @returns {{ ast: object, variables: string[] }}
 */
function parseExpression(input) {
  if (!input || !input.trim()) {
    throw new Error('Ekspresi tidak boleh kosong.');
  }

  const tokens   = tokenize(input);
  const variables = extractVariables(tokens);

  if (tokens.length === 0) {
    throw new Error('Ekspresi tidak boleh kosong.');
  }

  const parser = new Parser(tokens);
  const ast    = parser.parse();

  return { ast, variables };
}
