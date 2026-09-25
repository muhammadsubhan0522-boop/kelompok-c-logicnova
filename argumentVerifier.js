/**
 * argumentVerifier.js
 * -------------------
 * Memverifikasi validitas argumen logika:
 * Sebuah argumen valid ↔ tidak ada baris di mana semua premis benar
 * tetapi kesimpulan bernilai salah.
 *
 * Secara formal: argumen P1, P2, …, Pn ∴ C valid
 * jika dan hanya jika (P1 ∧ P2 ∧ … ∧ Pn) → C adalah tautologi.
 */

/**
 * Hasil verifikasi argumen.
 * @typedef {Object} ArgumentResult
 * @property {boolean}  isValid
 * @property {string}   explanation
 * @property {string[]} allVariables     - semua variabel gabungan
 * @property {object[]} premiseAsts      - AST tiap premis
 * @property {object}   conclusionAst
 * @property {Array}    tableRows        - data baris untuk rendering
 * @property {number[]} counterExamples  - indeks baris yang merupakan counter-example
 */

/**
 * Memverifikasi validitas argumen.
 * @param {string[]} premiseExpressions  - array string ekspresi premis
 * @param {string}   conclusionExpression - string ekspresi kesimpulan
 * @returns {ArgumentResult}
 */
function verifyArgument(premiseExpressions, conclusionExpression) {
  // Parse semua premis dan kesimpulan
  const parsedPremises   = premiseExpressions.map(expr => parseExpression(expr));
  const parsedConclusion = parseExpression(conclusionExpression);

  // Gabungkan semua variabel (urutan kemunculan pertama, tanpa duplikat)
  const allVariables = mergeVariables([
    ...parsedPremises.map(p => p.variables),
    parsedConclusion.variables,
  ]);

  const envs          = generateAllEnvironments(allVariables);
  const tableRows     = [];
  const counterExamples = [];
  let   isValid       = true;

  for (let i = 0; i < envs.length; i++) {
    const env = envs[i];

    const premiseValues   = parsedPremises.map(p => evaluateNode(p.ast, env));
    const conclusionValue = evaluateNode(parsedConclusion.ast, env);

    const allPremisesTrue = premiseValues.every(v => v === true);

    // Counter-example: semua premis T tapi kesimpulan F
    if (allPremisesTrue && !conclusionValue) {
      isValid = false;
      counterExamples.push(i);
    }

    tableRows.push({
      env,
      premiseValues,
      conclusionValue,
      allPremisesTrue,
    });
  }

  const explanation = buildExplanation(isValid, counterExamples, tableRows, allVariables, premiseExpressions, conclusionExpression);

  return {
    isValid,
    explanation,
    allVariables,
    premiseAsts:    parsedPremises.map(p => p.ast),
    conclusionAst:  parsedConclusion.ast,
    tableRows,
    counterExamples,
    premiseLabels:  premiseExpressions,
    conclusionLabel: conclusionExpression,
  };
}

/**
 * Merender tabel evaluasi argumen ke elemen <table>.
 * @param {HTMLTableElement} tableElement
 * @param {ArgumentResult}   result
 */
function renderArgumentTable(tableElement, result) {
  tableElement.innerHTML = '';

  const { allVariables, premiseLabels, conclusionLabel, tableRows, counterExamples } = result;

  // ── Header ────────────────────────────────────────────────────────────────
  const thead     = document.createElement('thead');
  const headerRow = document.createElement('tr');

  // Kolom variabel
  for (const varName of allVariables) {
    const th = document.createElement('th');
    th.textContent = varName;
    headerRow.appendChild(th);
  }

  // Kolom premis
  for (let i = 0; i < premiseLabels.length; i++) {
    const th = document.createElement('th');
    th.textContent = `P${i + 1}: ${truncateLabel(premiseLabels[i], 20)}`;
    th.className   = 'col-premise';
    th.title       = premiseLabels[i];
    headerRow.appendChild(th);
  }

  // Kolom kesimpulan
  const thConclusion = document.createElement('th');
  thConclusion.textContent = `C: ${truncateLabel(conclusionLabel, 20)}`;
  thConclusion.className   = 'col-conclusion';
  thConclusion.title       = conclusionLabel;
  headerRow.appendChild(thConclusion);

  thead.appendChild(headerRow);
  tableElement.appendChild(thead);

  // ── Body ──────────────────────────────────────────────────────────────────
  const tbody = document.createElement('tbody');

  for (let i = 0; i < tableRows.length; i++) {
    const row = tableRows[i];
    const tr  = document.createElement('tr');

    if (counterExamples.includes(i)) {
      tr.className = 'row-counterexample';
    }

    // Nilai variabel
    for (const varName of allVariables) {
      tr.appendChild(createBoolCell(row.env[varName]));
    }

    // Nilai premis
    for (const val of row.premiseValues) {
      tr.appendChild(createBoolCell(val));
    }

    // Nilai kesimpulan
    tr.appendChild(createBoolCell(row.conclusionValue));

    tbody.appendChild(tr);
  }

  tableElement.appendChild(tbody);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Gabungkan beberapa array variabel tanpa duplikat, menjaga urutan.
 * @param {string[][]} variableArrays
 * @returns {string[]}
 */
function mergeVariables(variableArrays) {
  const result = [];
  const seen   = new Set();

  for (const arr of variableArrays) {
    for (const v of arr) {
      if (!seen.has(v)) {
        seen.add(v);
        result.push(v);
      }
    }
  }

  return result;
}

/**
 * Buat teks penjelasan hasil verifikasi.
 */
function buildExplanation(isValid, counterExamples, tableRows, allVariables, premiseLabels, conclusionLabel) {
  if (isValid) {
    return `Argumen VALID. Tidak ada baris di mana semua premis bernilai benar (T) tetapi kesimpulan bernilai salah (F). Kesimpulan "${conclusionLabel}" secara logis mengikuti dari premis-premis yang diberikan.`;
  }

  const firstIdx = counterExamples[0];
  const env      = tableRows[firstIdx].env;
  const envStr   = allVariables.map(v => `${v}=${env[v] ? 'T' : 'F'}`).join(', ');

  return `Argumen TIDAK VALID. Ditemukan ${counterExamples.length} counter-example (baris disorot merah), yaitu kondisi di mana semua premis benar tetapi kesimpulan salah. Contoh: ${envStr}.`;
}

/**
 * Potong label agar tidak terlalu panjang di header tabel.
 */
function truncateLabel(label, maxLen) {
  return label.length > maxLen ? label.slice(0, maxLen) + '…' : label;
}
