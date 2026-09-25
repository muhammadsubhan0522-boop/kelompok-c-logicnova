/**
 * evaluator.js
 * ------------
 * Mengevaluasi AST dengan environment variabel tertentu,
 * dan mengklasifikasikan ekspresi (Tautologi/Kontradiksi/Kontingensi).
 */

/**
 * Evaluasi satu node AST secara rekursif.
 * @param {object} node     - Node AST hasil parser
 * @param {Object<string, boolean>} env - Peta variabel → nilai boolean
 * @returns {boolean}
 */
function evaluateNode(node, env) {
  switch (node.type) {
    case 'BOOL':
      return node.value;

    case 'VAR':
      if (!(node.name in env)) {
        throw new Error(`Variabel '${node.name}' tidak memiliki nilai.`);
      }
      return env[node.name];

    case 'UNARY':
      return evaluateUnary(node, env);

    case 'BINARY':
      return evaluateBinary(node, env);

    default:
      throw new Error(`Tipe node tidak dikenal: ${node.type}`);
  }
}

/**
 * Evaluasi node unary (hanya NOT).
 */
function evaluateUnary(node, env) {
  const operandValue = evaluateNode(node.operand, env);
  if (node.op === 'NOT') return !operandValue;
  throw new Error(`Operator unary tidak dikenal: ${node.op}`);
}

/**
 * Evaluasi node binary (AND, OR, IMPLIES, IFF, XOR).
 */
function evaluateBinary(node, env) {
  const leftValue  = evaluateNode(node.left,  env);
  const rightValue = evaluateNode(node.right, env);

  switch (node.op) {
    case 'AND':     return leftValue && rightValue;
    case 'OR':      return leftValue || rightValue;
    case 'XOR':     return leftValue !== rightValue;
    case 'IMPLIES': return !leftValue || rightValue;   // p→q ≡ ¬p∨q
    case 'IFF':     return leftValue === rightValue;
    default:
      throw new Error(`Operator binary tidak dikenal: ${node.op}`);
  }
}

// ── Klasifikasi ──────────────────────────────────────────────────────────────

const Classification = Object.freeze({
  TAUTOLOGY:     'Tautologi',
  CONTRADICTION: 'Kontradiksi',
  CONTINGENCY:   'Kontingensi',
});

/**
 * Mengklasifikasikan ekspresi berdasarkan semua baris tabel kebenaran.
 * @param {boolean[]} results - Nilai hasil evaluasi tiap baris
 * @returns {string} salah satu nilai Classification
 */
function classify(results) {
  const allTrue  = results.every(v => v === true);
  const allFalse = results.every(v => v === false);

  if (allTrue)  return Classification.TAUTOLOGY;
  if (allFalse) return Classification.CONTRADICTION;
  return Classification.CONTINGENCY;
}

/**
 * Menghasilkan semua kombinasi nilai boolean untuk sejumlah variabel.
 * Untuk n variabel menghasilkan 2^n kombinasi.
 * @param {string[]} variables
 * @returns {Object<string, boolean>[]}
 */
function generateAllEnvironments(variables) {
  const rowCount = Math.pow(2, variables.length);
  const envs = [];

  for (let i = 0; i < rowCount; i++) {
    const env = {};
    for (let j = 0; j < variables.length; j++) {
      // Bit ke-j (dari kiri) = apakah bit ke-(n-1-j) dari i adalah 1
      env[variables[j]] = Boolean((i >> (variables.length - 1 - j)) & 1);
    }
    envs.push(env);
  }

  return envs;
}
