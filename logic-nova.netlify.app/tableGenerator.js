/**
 * tableGenerator.js
 * -----------------
 * Menghasilkan data tabel kebenaran lengkap dari satu ekspresi,
 * lalu merender tabel tersebut ke dalam elemen <table> HTML.
 */

/**
 * Membangun data tabel kebenaran.
 * @param {object} ast         - AST hasil parser
 * @param {string[]} variables - Daftar variabel dalam ekspresi
 * @returns {{ rows: Array, results: boolean[], classification: string }}
 */
function buildTruthTableData(ast, variables) {
  const envs    = generateAllEnvironments(variables);
  const rows    = [];
  const results = [];

  for (const env of envs) {
    const result = evaluateNode(ast, env);
    results.push(result);
    rows.push({ env, result });
  }

  const classification = classify(results);

  return { rows, results, classification };
}

/**
 * Merender tabel kebenaran ke elemen <table>.
 * @param {HTMLTableElement} tableElement
 * @param {string[]} variables
 * @param {{ env: Object, result: boolean }[]} rows
 * @param {string} expressionLabel - Label untuk kolom hasil (ekspresi asli)
 */
function renderTruthTable(tableElement, variables, rows, expressionLabel) {
  tableElement.innerHTML = '';

  // ── Header ────────────────────────────────────────────────────────────────
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  for (const varName of variables) {
    const th = document.createElement('th');
    th.textContent = varName;
    headerRow.appendChild(th);
  }

  const thResult = document.createElement('th');
  thResult.textContent = expressionLabel;
  thResult.style.maxWidth = '260px';
  thResult.style.overflow = 'hidden';
  thResult.style.textOverflow = 'ellipsis';
  headerRow.appendChild(thResult);

  thead.appendChild(headerRow);
  tableElement.appendChild(thead);

  // ── Body ──────────────────────────────────────────────────────────────────
  const tbody = document.createElement('tbody');

  for (const row of rows) {
    const tr = document.createElement('tr');

    for (const varName of variables) {
      const td = createBoolCell(row.env[varName]);
      tr.appendChild(td);
    }

    const tdResult = createBoolCell(row.result);
    tr.appendChild(tdResult);

    tbody.appendChild(tr);
  }

  tableElement.appendChild(tbody);
}

/**
 * Membuat elemen <td> dengan teks T/F dan warna sesuai nilai.
 * @param {boolean} value
 * @returns {HTMLTableCellElement}
 */
function createBoolCell(value) {
  const td = document.createElement('td');
  td.textContent = value ? 'T' : 'F';
  td.className   = value ? 'cell-true' : 'cell-false';
  return td;
}
