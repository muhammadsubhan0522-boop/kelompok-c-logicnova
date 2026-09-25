/**
 * ui.js
 * -----
 * Controller utama antarmuka — tab, tabel kebenaran, verifikator argumen.
 */

// ── Preset argumen ────────────────────────────────────────────────────────────
const ARGUMENT_PRESETS = {
  'modus-ponens':    { premises: ['p IMPLIES q', 'p'],           conclusion: 'q'           },
  'modus-tollens':   { premises: ['p IMPLIES q', 'NOT q'],       conclusion: 'NOT p'       },
  'hypothetical':    { premises: ['p IMPLIES q', 'q IMPLIES r'], conclusion: 'p IMPLIES r' },
  'invalid':         { premises: ['p IMPLIES q'],                conclusion: 'p'           },
};

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  try {
    initTabs();
    initTruthTableSection();
    initArgumentSection();
  } catch (e) {
    console.error('Init error:', e);
  }
});

// ── TAB NAVIGATION ────────────────────────────────────────────────────────────
function initTabs() {
  var tabButtons = document.querySelectorAll('.tab-btn');
  var tabPanels  = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = 'tab-' + btn.getAttribute('data-tab');

      tabButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      tabPanels.forEach(function (panel) {
        if (panel.id === targetId) {
          panel.classList.remove('hidden');
        } else {
          panel.classList.add('hidden');
        }
      });
    });
  });
}

// ── TRUTH TABLE ───────────────────────────────────────────────────────────────
function initTruthTableSection() {
  var input       = document.getElementById('expression-input');
  var genBtn      = document.getElementById('generate-btn');
  var clearBtn    = document.getElementById('clear-btn');
  var errorBox    = document.getElementById('expression-error');
  var resultSec   = document.getElementById('result-section');

  genBtn.addEventListener('click', function () {
    handleGenerateTruthTable(input.value, errorBox, resultSec);
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') genBtn.click();
  });

  clearBtn.addEventListener('click', function () {
    input.value = '';
    hideEl(errorBox);
    hideEl(resultSec);
    input.focus();
  });

  // Quick-insert operator chips
  document.querySelectorAll('.chip-op, .chip-paren').forEach(function (chip) {
    chip.addEventListener('click', function () {
      insertAtCursor(input, chip.getAttribute('data-op'));
      input.focus();
    });
  });

  // Preset example chips (truth table tab)
  document.querySelectorAll('#tab-truth-table .chip-example').forEach(function (chip) {
    chip.addEventListener('click', function () {
      input.value = chip.getAttribute('data-expr');
      input.focus();
      genBtn.click();
    });
  });
}

function handleGenerateTruthTable(rawInput, errorBox, resultSec) {
  hideEl(errorBox);
  hideEl(resultSec);

  try {
    if (!rawInput || !rawInput.trim()) throw new Error('Ekspresi tidak boleh kosong.');

    var parsed    = parseExpression(rawInput);
    var ast       = parsed.ast;
    var variables = parsed.variables;

    if (variables.length === 0) throw new Error('Ekspresi harus mengandung minimal satu variabel (contoh: p, q, r).');
    if (variables.length > 10) throw new Error('Terlalu banyak variabel (maks 10).');

    var data           = buildTruthTableData(ast, variables);
    var rows           = data.rows;
    var classification = data.classification;
    var results        = data.results;

    renderClassification(classification);
    renderStats(results, rows.length);

    var countEl = document.getElementById('table-row-count');
    if (countEl) countEl.textContent = rows.length + ' baris';

    renderTruthTable(document.getElementById('truth-table'), variables, rows, rawInput.trim());
    showEl(resultSec);

  } catch (err) {
    showError(errorBox, err.message);
  }
}

function renderClassification(classification) {
  var badge = document.getElementById('classification-result');
  var desc  = document.getElementById('classification-desc');

  var map = {
    'Tautologi':   { cls: 'badge-tautology',    icon: '✅', text: 'Bernilai TRUE untuk semua kombinasi variabel.' },
    'Kontradiksi': { cls: 'badge-contradiction', icon: '❌', text: 'Bernilai FALSE untuk semua kombinasi variabel.' },
    'Kontingensi': { cls: 'badge-contingency',   icon: '🔀', text: 'Nilainya bergantung pada kombinasi variabel — ada T dan ada F.' },
  };

  var cfg = map[classification];
  if (!cfg) return;

  badge.textContent = cfg.icon + '  ' + classification;
  badge.className   = 'classification-badge ' + cfg.cls;
  desc.textContent  = cfg.text;
}

function renderStats(results, total) {
  var container = document.getElementById('stats-row');
  if (!container) return;

  var trueCount  = results.filter(function (v) { return v; }).length;
  var falseCount = total - trueCount;

  container.innerHTML =
    '<div class="stat-item">' +
      '<span class="stat-label">Total baris</span>' +
      '<span class="stat-val blue">' + total + '</span>' +
    '</div>' +
    '<div class="stat-item">' +
      '<span class="stat-label">Baris TRUE</span>' +
      '<span class="stat-val green">' + trueCount + '</span>' +
    '</div>' +
    '<div class="stat-item">' +
      '<span class="stat-label">Baris FALSE</span>' +
      '<span class="stat-val red">' + falseCount + '</span>' +
    '</div>';
}

// ── ARGUMENT VERIFIER ─────────────────────────────────────────────────────────
var premiseCount = 0;

function initArgumentSection() {
  var addBtn    = document.getElementById('add-premise-btn');
  var verifyBtn = document.getElementById('verify-btn');
  var clearBtn  = document.getElementById('clear-arg-btn');
  var errorBox  = document.getElementById('argument-error');
  var resultSec = document.getElementById('argument-result-section');

  addPremise();
  addPremise();

  addBtn.addEventListener('click', function () {
    if (premiseCount >= 8) { showError(errorBox, 'Maksimum 8 premis.'); return; }
    addPremise();
  });

  verifyBtn.addEventListener('click', function () {
    hideEl(errorBox);
    hideEl(resultSec);
    handleVerifyArgument(errorBox, resultSec);
  });

  clearBtn.addEventListener('click', function () {
    resetArgumentSection();
    hideEl(errorBox);
    hideEl(resultSec);
  });

  // Preset chips di tab argumen
  document.querySelectorAll('#tab-argument .chip-example').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var key    = chip.getAttribute('data-arg');
      var preset = ARGUMENT_PRESETS[key];
      if (!preset) return;

      // Reset dan isi ulang
      var container = document.getElementById('premises-container');
      container.innerHTML = '';
      premiseCount = 0;

      preset.premises.forEach(function (expr) {
        addPremise(expr);
      });

      document.getElementById('conclusion-input').value = preset.conclusion;
      hideEl(errorBox);
      hideEl(resultSec);
    });
  });
}

function addPremise(defaultValue) {
  premiseCount++;
  var index     = premiseCount;
  var container = document.getElementById('premises-container');

  var row = document.createElement('div');
  row.className      = 'premise-row';
  row.dataset.index  = index;

  row.innerHTML =
    '<span class="premise-label">P' + index + '</span>' +
    '<div class="input-wrapper" style="flex:1">' +
      '<span class="input-prefix" style="min-width:32px;justify-content:center;">' + index + '</span>' +
      '<input type="text" class="text-input premise-input"' +
      '  placeholder="Contoh: p IMPLIES q"' +
      '  autocomplete="off" spellcheck="false"' +
      '  data-premise-index="' + index + '" />' +
    '</div>' +
    '<button class="remove-premise-btn" title="Hapus premis">✕</button>';

  if (defaultValue) {
    // set setelah insert
    setTimeout(function () {
      var inp = row.querySelector('.premise-input');
      if (inp) inp.value = defaultValue;
    }, 0);
  }

  row.querySelector('.remove-premise-btn').addEventListener('click', function () {
    container.removeChild(row);
    reNumberPremises();
  });

  container.appendChild(row);
}

function reNumberPremises() {
  var rows = document.querySelectorAll('#premises-container .premise-row');
  var num  = 1;
  rows.forEach(function (row) {
    var lbl = row.querySelector('.premise-label');
    var pfx = row.querySelector('.input-prefix');
    if (lbl) lbl.textContent = 'P' + num;
    if (pfx) pfx.textContent = num;
    num++;
  });
  premiseCount = rows.length;
}

function resetArgumentSection() {
  document.getElementById('premises-container').innerHTML = '';
  premiseCount = 0;
  document.getElementById('conclusion-input').value = '';
  addPremise();
  addPremise();
}

function handleVerifyArgument(errorBox, resultSec) {
  try {
    var inputs      = document.querySelectorAll('.premise-input');
    var premiseExprs = [];
    inputs.forEach(function (inp) {
      var v = inp.value.trim();
      if (v) premiseExprs.push(v);
    });

    var conclusion = document.getElementById('conclusion-input').value.trim();

    if (premiseExprs.length === 0) throw new Error('Masukkan minimal satu premis.');
    if (!conclusion)               throw new Error('Kesimpulan tidak boleh kosong.');

    var result = verifyArgument(premiseExprs, conclusion);
    renderArgumentResult(result);
    showEl(resultSec);

  } catch (err) {
    showError(errorBox, err.message);
  }
}

function renderArgumentResult(result) {
  var verdictEl = document.getElementById('argument-verdict');
  var explanEl  = document.getElementById('argument-explanation');

  if (result.isValid) {
    verdictEl.textContent = '✅  Argumen VALID';
    verdictEl.className   = 'verdict-badge badge-valid';
  } else {
    verdictEl.textContent = '❌  Argumen TIDAK VALID';
    verdictEl.className   = 'verdict-badge badge-invalid';
  }

  explanEl.textContent = result.explanation;

  renderArgumentTable(document.getElementById('argument-table'), result);
}

// ── UTILS ─────────────────────────────────────────────────────────────────────
function showEl(el)  { if (el) el.classList.remove('hidden'); }
function hideEl(el)  { if (el) el.classList.add('hidden'); }

function showError(el, msg) {
  if (!el) return;
  el.textContent = msg;
  showEl(el);
}

function insertAtCursor(input, text) {
  var start = input.selectionStart;
  var end   = input.selectionEnd;
  input.value = input.value.slice(0, start) + text + input.value.slice(end);
  input.selectionStart = input.selectionEnd = start + text.length;
}
