/* ================================================
   SetClassify — script.js
   PJBL-2 Matematika Diskrit
   Sistem Klasifikasi Data Menggunakan Himpunan
================================================ */

'use strict';

/* ================================================
   1. KONSTANTA & KONFIGURASI
================================================ */
const STORAGE_KEY  = 'setclassify_dataset';
const LAST_OP_KEY  = 'setclassify_last_op';
const DATA_VERSION = 'v3'; // naikkan versi jika dummy data diubah
const VERSION_KEY  = 'setclassify_version';

// Kriteria pembentukan himpunan
const CRITERIA = {
  A: s => s.nilai >= 80,
  B: s => s.organisasi === 'Ya',
  C: s => s.kehadiran >= 80
};

// Simbol per operasi (dipakai untuk update tampilan dropdown)
const OP_SYMBOLS = {
  union:          '∪',
  intersection:   '∩',
  difference_ab:  '−',
  difference_ba:  '−',
  complement:     'ᶜ'
};

/* ================================================
   2. DATA DUMMY (20 mahasiswa bervariasi)
   Dirancang agar semua irisan terisi
================================================ */
const DUMMY_DATA = [
  { nim:'25210005', nama:'Okta Satria',             nilai:90, organisasi:'Ya',    kehadiran:92 },
  { nim:'25210469', nama:'Tara Tursina',            nilai:85, organisasi:'Ya',    kehadiran:88 },
  { nim:'25210129', nama:'Kurnia Haidar',           nilai:88, organisasi:'Ya',    kehadiran:85 },
  { nim:'25210395', nama:'Muhammad Rezky Syawalli', nilai:82, organisasi:'Ya',    kehadiran:75 },
  { nim:'25210099', nama:'Nisaul Husna',            nilai:80, organisasi:'Ya',    kehadiran:70 },
  { nim:'25210055', nama:'Diola Humaira',           nilai:91, organisasi:'Tidak', kehadiran:90 },
  { nim:'25210451', nama:'Kelvin Faturi Zayyan',    nilai:83, organisasi:'Tidak', kehadiran:82 },
  { nim:'25210355', nama:'M. Subhan',               nilai:72, organisasi:'Ya',    kehadiran:86 }
];

/* ================================================
   3. STATE APLIKASI
================================================ */
let currentPage   = 'dashboard';
let lastOpResult  = null;  // { title, formula, explanation, members, opType, setNames }
let searchQuery   = '';
let filterValue   = 'all';

/* ================================================
   4. PENYIMPANAN DATA (localStorage)
================================================ */

/**
 * Simpan dataset ke localStorage.
 */
function saveData(dataset) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataset));
}

/**
 * Muat dataset dari localStorage.
 * Jika belum ada atau versi lama, reset dengan data dummy baru.
 */
function loadData() {
  const storedVersion = localStorage.getItem(VERSION_KEY);
  if (storedVersion !== DATA_VERSION) {
    // Versi berbeda → reset ke dummy terbaru
    localStorage.setItem(VERSION_KEY, DATA_VERSION);
    localStorage.removeItem(LAST_OP_KEY);
    saveData(DUMMY_DATA);
    return [...DUMMY_DATA];
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw); }
    catch { /* data rusak, reset */ }
  }
  saveData(DUMMY_DATA);
  return [...DUMMY_DATA];
}

/**
 * Simpan info operasi terakhir.
 */
function saveLastOp(info) {
  localStorage.setItem(LAST_OP_KEY, JSON.stringify(info));
}

/**
 * Muat info operasi terakhir.
 */
function loadLastOp() {
  const raw = localStorage.getItem(LAST_OP_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

/* ================================================
   5. PEMBENTUKAN HIMPUNAN
================================================ */

/** Semesta U — seluruh mahasiswa */
function getUniverse() {
  return loadData();
}

/** Himpunan A — Nilai Tinggi (nilai ≥ 80) */
function getSetA() {
  return getUniverse().filter(CRITERIA.A);
}

/** Himpunan B — Aktif Organisasi */
function getSetB() {
  return getUniverse().filter(CRITERIA.B);
}

/** Himpunan C — Kehadiran Tinggi (kehadiran ≥ 80%) */
function getSetC() {
  return getUniverse().filter(CRITERIA.C);
}

/**
 * Ambil himpunan berdasarkan kode ('A','B','C','U').
 */
function getSetByCode(code) {
  switch (code) {
    case 'A': return getSetA();
    case 'B': return getSetB();
    case 'C': return getSetC();
    case 'U': return getUniverse();
    default:  return [];
  }
}

/* ================================================
   6. OPERASI HIMPUNAN (logika matematika)
   Identifier unik: NIM
================================================ */

/** Union A ∪ B — gabungan tanpa duplikasi */
function union(setA, setB) {
  const map = new Map();
  [...setA, ...setB].forEach(s => map.set(s.nim, s));
  return [...map.values()];
}

/** Intersection A ∩ B — anggota yang ada di keduanya */
function intersection(setA, setB) {
  const nimB = new Set(setB.map(s => s.nim));
  return setA.filter(s => nimB.has(s.nim));
}

/** Difference A − B — anggota A yang tidak ada di B */
function difference(setA, setB) {
  const nimB = new Set(setB.map(s => s.nim));
  return setA.filter(s => !nimB.has(s.nim));
}

/** Complement Aᶜ terhadap U — anggota U yang tidak ada di A */
function complement(setA, universe) {
  const nimA = new Set(setA.map(s => s.nim));
  return universe.filter(s => !nimA.has(s.nim));
}

/* ================================================
   7. RENDER HELPERS
================================================ */

/**
 * Tentukan himpunan mana saja yang diikuti seorang mahasiswa.
 */
function getMemberships(student) {
  const m = [];
  if (CRITERIA.A(student)) m.push('A');
  if (CRITERIA.B(student)) m.push('B');
  if (CRITERIA.C(student)) m.push('C');
  return m;
}

/**
 * Buat HTML chip keanggotaan himpunan.
 */
function renderChips(student) {
  const m = getMemberships(student);
  if (m.length === 0) return `<span class="chip chip--none">—</span>`;
  return m.map(x => `<span class="chip chip--${x.toLowerCase()}">${x}</span>`).join('');
}

/**
 * Buat satu baris tabel dataset.
 */
function renderDataRow(student) {
  return `
    <tr data-nim="${escHtml(student.nim)}">
      <td><strong>${escHtml(student.nim)}</strong></td>
      <td>${escHtml(student.nama)}</td>
      <td>${student.nilai}</td>
      <td>${student.organisasi === 'Ya'
            ? '<span class="chip chip--b">Ya</span>'
            : '<span class="chip chip--none">Tidak</span>'}</td>
      <td>${student.kehadiran}%</td>
      <td><div class="membership-chips">${renderChips(student)}</div></td>
      <td>
        <div style="display:flex;gap:6px;">
          <button class="btn btn--icon" title="Edit" onclick="openEditModal('${escHtml(student.nim)}')">✎</button>
          <button class="btn btn--icon btn--danger-icon" title="Hapus" onclick="deleteStudent('${escHtml(student.nim)}')">✕</button>
        </div>
      </td>
    </tr>`;
}

/**
 * Render tabel dataset dengan filter & search aktif.
 */
function renderDataset() {
  let data = getUniverse();

  // Filter berdasarkan himpunan
  if (filterValue !== 'all') {
    if (filterValue === 'none') {
      data = data.filter(s => getMemberships(s).length === 0);
    } else {
      data = data.filter(s => getMemberships(s).includes(filterValue));
    }
  }

  // Filter berdasarkan pencarian
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    data = data.filter(s =>
      s.nim.toLowerCase().includes(q) ||
      s.nama.toLowerCase().includes(q)
    );
  }

  const tbody  = document.getElementById('dataTableBody');
  const empty  = document.getElementById('tableEmpty');
  const info   = document.getElementById('tableInfo');

  if (data.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    info.textContent = 'Tidak ada data yang sesuai.';
  } else {
    tbody.innerHTML = data.map(renderDataRow).join('');
    empty.style.display = 'none';
    info.textContent = `Menampilkan ${data.length} dari ${getUniverse().length} data.`;
  }
}

/**
 * Render satu item anggota di halaman Himpunan.
 */
function renderMemberItem(student, detail) {
  return `
    <div class="member-item">
      <span class="member-nim">${escHtml(student.nim)}</span>
      <span class="member-name">${escHtml(student.nama)}</span>
      <span class="member-detail">${detail}</span>
    </div>`;
}

/**
 * Render semua himpunan di halaman Himpunan.
 */
function renderSets() {
  const U = getUniverse();
  const A = getSetA();
  const B = getSetB();
  const C = getSetC();

  // Counts
  document.getElementById('setCountU').textContent = U.length;
  document.getElementById('setCountA').textContent = A.length;
  document.getElementById('setCountB').textContent = B.length;
  document.getElementById('setCountC').textContent = C.length;

  const elU = document.getElementById('setMembersU');
  const elA = document.getElementById('setMembersA');
  const elB = document.getElementById('setMembersB');
  const elC = document.getElementById('setMembersC');

  elU.innerHTML = U.length
    ? U.map(s => renderMemberItem(s, `Nilai: ${s.nilai} | Hadir: ${s.kehadiran}%`)).join('')
    : '<p class="empty-text">Dataset kosong.</p>';

  elA.innerHTML = A.length
    ? A.map(s => renderMemberItem(s, `Nilai: ${s.nilai}`)).join('')
    : '<p class="empty-text" style="padding:8px 0;font-size:12px;color:var(--clr-text-muted);">Tidak ada anggota.</p>';

  elB.innerHTML = B.length
    ? B.map(s => renderMemberItem(s, `Organisasi: Ya`)).join('')
    : '<p class="empty-text" style="padding:8px 0;font-size:12px;color:var(--clr-text-muted);">Tidak ada anggota.</p>';

  elC.innerHTML = C.length
    ? C.map(s => renderMemberItem(s, `Kehadiran: ${s.kehadiran}%`)).join('')
    : '<p class="empty-text" style="padding:8px 0;font-size:12px;color:var(--clr-text-muted);">Tidak ada anggota.</p>';
}

/**
 * Perbarui semua angka di Dashboard.
 */
function updateDashboard() {
  const U = getUniverse();
  document.getElementById('statTotal').textContent = U.length;
  document.getElementById('statA').textContent     = getSetA().length;
  document.getElementById('statB').textContent     = getSetB().length;
  document.getElementById('statC').textContent     = getSetC().length;
  document.getElementById('totalBadge').textContent = `${U.length} data`;

  // Operasi terakhir
  const op = loadLastOp();
  const el = document.getElementById('lastOpDisplay');
  if (op) {
    el.innerHTML = `
      <div class="last-op-info">
        <div class="op-name">${escHtml(op.formula)}</div>
        <div class="op-detail">${escHtml(op.title)} — ${op.count} mahasiswa ditemukan</div>
      </div>`;
  } else {
    el.innerHTML = '<p class="empty-text">Belum ada operasi yang dijalankan.</p>';
  }
}

/* ================================================
   8. OPERASI HIMPUNAN — HANDLER
================================================ */

/**
 * Bangun nama & penjelasan operasi secara dinamis.
 */
function buildOpMeta(opType, nameFirst, nameSecond) {
  const labelMap = {
    A: 'Nilai Tinggi (≥80)',
    B: 'Aktif Organisasi',
    C: 'Kehadiran Tinggi (≥80%)',
    U: 'Semesta'
  };

  switch (opType) {
    case 'union':
      return {
        title:       `${nameFirst} ∪ ${nameSecond} — Union`,
        formula:     `${nameFirst} ∪ ${nameSecond}`,
        explanation: `Menggabungkan seluruh mahasiswa dari Himpunan ${nameFirst} (${labelMap[nameFirst]}) dan Himpunan ${nameSecond} (${labelMap[nameSecond]}) tanpa duplikasi.`
      };
    case 'intersection':
      return {
        title:       `${nameFirst} ∩ ${nameSecond} — Intersection`,
        formula:     `${nameFirst} ∩ ${nameSecond}`,
        explanation: `Menampilkan mahasiswa yang sekaligus memenuhi kriteria Himpunan ${nameFirst} (${labelMap[nameFirst]}) dan Himpunan ${nameSecond} (${labelMap[nameSecond]}).`
      };
    case 'difference_ab':
      return {
        title:       `${nameFirst} − ${nameSecond} — Difference`,
        formula:     `${nameFirst} − ${nameSecond}`,
        explanation: `Menampilkan mahasiswa yang ada di Himpunan ${nameFirst} (${labelMap[nameFirst]}) tetapi tidak ada di Himpunan ${nameSecond} (${labelMap[nameSecond]}).`
      };
    case 'difference_ba':
      return {
        title:       `${nameSecond} − ${nameFirst} — Difference`,
        formula:     `${nameSecond} − ${nameFirst}`,
        explanation: `Menampilkan mahasiswa yang ada di Himpunan ${nameSecond} (${labelMap[nameSecond]}) tetapi tidak ada di Himpunan ${nameFirst} (${labelMap[nameFirst]}).`
      };
    case 'complement':
      return {
        title:       `${nameFirst}ᶜ — Complement`,
        formula:     `${nameFirst}ᶜ`,
        explanation: `Menampilkan mahasiswa yang berada di Semesta U tetapi tidak masuk dalam Himpunan ${nameFirst} (${labelMap[nameFirst]}).`
      };
    default:
      return { title: '—', formula: '—', explanation: '—' };
  }
}

/**
 * Jalankan operasi himpunan yang dipilih.
 */
function runOperation() {
  const opType = document.getElementById('opSelect').value;
  const U      = getUniverse();

  if (U.length === 0) {
    showToast('Dataset kosong. Tambah data terlebih dahulu.', 'error');
    return;
  }

  let resultMembers = [];
  let nameFirst, nameSecond, setFirst, setSecond;

  if (opType === 'complement') {
    nameFirst  = document.getElementById('setComplement').value;
    setFirst   = getSetByCode(nameFirst);
    resultMembers = complement(setFirst, U);
    nameSecond = 'U';
  } else {
    nameFirst  = document.getElementById('setFirst').value;
    nameSecond = document.getElementById('setSecond').value;
    setFirst   = getSetByCode(nameFirst);
    setSecond  = getSetByCode(nameSecond);

    switch (opType) {
      case 'union':         resultMembers = union(setFirst, setSecond);        break;
      case 'intersection':  resultMembers = intersection(setFirst, setSecond); break;
      case 'difference_ab': resultMembers = difference(setFirst, setSecond);   break;
      case 'difference_ba': resultMembers = difference(setSecond, setFirst);   break;
    }
  }

  const meta = buildOpMeta(opType, nameFirst, nameSecond);

  // Simpan hasil ke state
  lastOpResult = {
    title:       meta.title,
    formula:     meta.formula,
    explanation: meta.explanation,
    members:     resultMembers,
    opType,
    nameFirst,
    nameSecond
  };

  // Simpan ke localStorage untuk dashboard
  saveLastOp({ title: meta.title, formula: meta.formula, count: resultMembers.length });

  // Render hasil
  renderResult();
  updateDashboard();

  showToast(`Operasi ${meta.formula} berhasil — ${resultMembers.length} mahasiswa ditemukan.`, 'success');
}

/**
 * Render tabel hasil operasi.
 */
function renderResult() {
  if (!lastOpResult) return;

  const { title, formula, explanation, members } = lastOpResult;

  // Sembunyikan placeholder, tampilkan hasil
  document.getElementById('resultPlaceholder').style.display = 'none';
  const resultContent = document.getElementById('resultContent');
  resultContent.classList.remove('hidden');
  resultContent.style.display = '';  // hapus inline style kalau ada

  document.getElementById('resultTitle').textContent       = title;
  document.getElementById('resultFormula').textContent     = formula;
  document.getElementById('resultExplanation').textContent = explanation;
  document.getElementById('resultCount').textContent       = `${members.length} mahasiswa`;

  // Render tabel
  const tbody = document.getElementById('resultTableBody');
  const empty = document.getElementById('resultEmpty');

  if (members.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
    tbody.innerHTML = members.map((s, i) => `
      <tr class="result-table-row">
        <td>${i + 1}</td>
        <td><strong>${escHtml(s.nim)}</strong></td>
        <td>${escHtml(s.nama)}</td>
        <td>${s.nilai}</td>
        <td>${s.organisasi === 'Ya'
              ? '<span class="chip chip--b">Ya</span>'
              : '<span class="chip chip--none">Tidak</span>'}</td>
        <td>${s.kehadiran}%</td>
      </tr>`).join('');
  }

  // Render Diagram Venn
  renderVenn(lastOpResult);
}

/* ================================================
   9. DIAGRAM VENN (SVG dinamis)
================================================ */

/**
 * Render Diagram Venn berdasarkan operasi yang sedang aktif.
 */
function renderVenn(opResult) {
  const container = document.getElementById('vennDiagram');
  const { opType, nameFirst, nameSecond } = opResult;

  if (opType === 'complement') {
    container.innerHTML = renderVennComplement(opResult);
  } else {
    container.innerHTML = renderVennTwoSets(opResult);
  }
}

/**
 * Diagram Venn untuk dua himpunan.
 */
function renderVennTwoSets(opResult) {
  const { opType, nameFirst, nameSecond, members } = opResult;

  const setFirst  = getSetByCode(nameFirst);
  const setSecond = getSetByCode(nameSecond);
  const inter     = intersection(setFirst, setSecond);
  const onlyFirst = difference(setFirst, setSecond);
  const onlySecond= difference(setSecond, setFirst);

  // Warna berdasarkan operasi
  const colorMap = { A:'#a0522d', B:'#2e7d6b', C:'#5c6bc0', U:'#6b7280' };
  const c1 = colorMap[nameFirst]  || '#a0522d';
  const c2 = colorMap[nameSecond] || '#2e7d6b';

  // Tentukan bagian mana yang di-highlight
  const resultNims = new Set(members.map(s => s.nim));

  // Apakah setiap region ter-highlight?
  const hlLeft  = onlyFirst.some(s  => resultNims.has(s.nim));
  const hlMid   = inter.some(s      => resultNims.has(s.nim));
  const hlRight = onlySecond.some(s => resultNims.has(s.nim));

  // ID unik per render agar tidak duplikat di DOM
  const uid = Date.now();

  return `
  <svg viewBox="0 0 420 200" xmlns="http://www.w3.org/2000/svg" width="420" height="200">
    <!-- Universe rect -->
    <rect x="10" y="10" width="400" height="180" rx="10"
          fill="#f8f4ef" stroke="#e8ddd2" stroke-width="1.5"/>
    <text x="22" y="30" font-family="Segoe UI,sans-serif" font-size="11"
          fill="#8a7060" font-weight="600">U</text>

    <!-- Lingkaran kiri -->
    <circle cx="160" cy="100" r="70"
            fill="${c1}" fill-opacity=".12"
            stroke="${c1}" stroke-width="2"/>

    <!-- Lingkaran kanan -->
    <circle cx="260" cy="100" r="70"
            fill="${c2}" fill-opacity=".12"
            stroke="${c2}" stroke-width="2"/>

    <!-- Highlight: Only Left -->
    <clipPath id="clipLeft${uid}">
      <circle cx="160" cy="100" r="70"/>
    </clipPath>
    <circle cx="160" cy="100" r="70"
            fill="${hlLeft ? c1 : 'none'}" fill-opacity="${hlLeft ? '.35' : '0'}"
            clip-path="url(#clipLeft${uid})"/>
    <!-- Mask out intersection from left highlight -->
    <circle cx="260" cy="100" r="70"
            fill="${hlLeft ? '#f8f4ef' : 'none'}" fill-opacity="${hlLeft ? '.7' : '0'}"
            clip-path="url(#clipLeft${uid})"/>

    <!-- Highlight: Only Right -->
    <clipPath id="clipRight${uid}">
      <circle cx="260" cy="100" r="70"/>
    </clipPath>
    <circle cx="260" cy="100" r="70"
            fill="${hlRight ? c2 : 'none'}" fill-opacity="${hlRight ? '.35' : '0'}"
            clip-path="url(#clipRight${uid})"/>
    <circle cx="160" cy="100" r="70"
            fill="${hlRight ? '#f8f4ef' : 'none'}" fill-opacity="${hlRight ? '.7' : '0'}"
            clip-path="url(#clipRight${uid})"/>

    <!-- Highlight: Intersection -->
    <clipPath id="clipInter${uid}">
      <circle cx="160" cy="100" r="70"/>
    </clipPath>
    <circle cx="260" cy="100" r="70"
            fill="${hlMid ? '#6d4c28' : 'none'}" fill-opacity="${hlMid ? '.40' : '0'}"
            clip-path="url(#clipInter${uid})"/>

    <!-- Label A -->
    <text x="118" y="95" font-family="Segoe UI,sans-serif" font-size="15"
          font-weight="700" fill="${c1}" text-anchor="middle">${escHtml(nameFirst)}</text>
    <text x="118" y="112" font-family="Segoe UI,sans-serif" font-size="11"
          fill="#8a7060" text-anchor="middle">${onlyFirst.length}</text>

    <!-- Label B -->
    <text x="302" y="95" font-family="Segoe UI,sans-serif" font-size="15"
          font-weight="700" fill="${c2}" text-anchor="middle">${escHtml(nameSecond)}</text>
    <text x="302" y="112" font-family="Segoe UI,sans-serif" font-size="11"
          fill="#8a7060" text-anchor="middle">${onlySecond.length}</text>

    <!-- Label Intersection -->
    <text x="210" y="95" font-family="Segoe UI,sans-serif" font-size="11"
          font-weight="600" fill="#3d2e1e" text-anchor="middle">${nameFirst}∩${nameSecond}</text>
    <text x="210" y="111" font-family="Segoe UI,sans-serif" font-size="11"
          fill="#8a7060" text-anchor="middle">${inter.length}</text>

    <!-- Hasil label -->
    <text x="210" y="175" font-family="Segoe UI,sans-serif" font-size="11"
          fill="#8a7060" text-anchor="middle">Hasil: ${members.length} mahasiswa</text>
  </svg>`;
}

/**
 * Diagram Venn untuk Complement.
 */
function renderVennComplement(opResult) {
  const { nameFirst, members } = opResult;
  const colorMap = { A:'#a0522d', B:'#2e7d6b', C:'#5c6bc0' };
  const c1 = colorMap[nameFirst] || '#a0522d';
  const setFirst = getSetByCode(nameFirst);

  return `
  <svg viewBox="0 0 420 200" xmlns="http://www.w3.org/2000/svg" width="420" height="200">
    <!-- Universe rect — highlighted (complement region) -->
    <rect x="10" y="10" width="400" height="180" rx="10"
          fill="#a0522d" fill-opacity=".12" stroke="#e8ddd2" stroke-width="1.5"/>
    <text x="22" y="30" font-family="Segoe UI,sans-serif" font-size="11"
          fill="#8a7060" font-weight="600">U</text>

    <!-- Mask: lingkaran himpunan (putih = bukan komplemen) -->
    <circle cx="210" cy="100" r="68"
            fill="${c1}" fill-opacity=".18"
            stroke="${c1}" stroke-width="2"/>
    <!-- Overlap warna putih untuk menunjukkan bukan bagian hasil -->
    <circle cx="210" cy="100" r="68" fill="#fff" fill-opacity=".6"/>

    <!-- Label himpunan -->
    <text x="210" y="97" font-family="Segoe UI,sans-serif" font-size="15"
          font-weight="700" fill="${c1}" text-anchor="middle">${escHtml(nameFirst)}</text>
    <text x="210" y="115" font-family="Segoe UI,sans-serif" font-size="11"
          fill="#8a7060" text-anchor="middle">${setFirst.length} anggota</text>

    <!-- Label komplemen (bagian luar lingkaran) -->
    <text x="60" y="145" font-family="Segoe UI,sans-serif" font-size="11"
          font-weight="600" fill="#3d2e1e" text-anchor="middle">${escHtml(nameFirst)}ᶜ</text>
    <text x="60" y="160" font-family="Segoe UI,sans-serif" font-size="11"
          fill="#8a7060" text-anchor="middle">${members.length}</text>

    <!-- Keterangan -->
    <text x="210" y="183" font-family="Segoe UI,sans-serif" font-size="11"
          fill="#8a7060" text-anchor="middle">
      ${escHtml(nameFirst)}ᶜ = U − ${escHtml(nameFirst)} = ${members.length} mahasiswa
    </text>
  </svg>`;
}

/* ================================================
   10. CRUD DATASET
================================================ */

/** Buka modal untuk tambah data baru. */
function openAddModal() {
  clearForm();
  document.getElementById('modalTitle').textContent = 'Tambah Data Mahasiswa';
  document.getElementById('editNimOriginal').value  = '';
  document.getElementById('btnModalSave').textContent = 'Simpan';
  openModal();
}

/** Buka modal untuk edit data. */
function openEditModal(nim) {
  const data    = getUniverse();
  const student = data.find(s => s.nim === nim);
  if (!student) return;

  clearForm();
  document.getElementById('modalTitle').textContent   = 'Edit Data Mahasiswa';
  document.getElementById('editNimOriginal').value    = nim;
  document.getElementById('fNim').value               = student.nim;
  document.getElementById('fNama').value              = student.nama;
  document.getElementById('fNilai').value             = student.nilai;
  document.getElementById('fKehadiran').value         = student.kehadiran;
  document.querySelector(`input[name="fOrganisasi"][value="${student.organisasi}"]`).checked = true;
  document.getElementById('btnModalSave').textContent = 'Perbarui';
  openModal();
}

/** Hapus satu mahasiswa. */
function deleteStudent(nim) {
  if (!confirm(`Hapus data mahasiswa dengan NIM ${nim}?`)) return;
  let data = getUniverse();
  data = data.filter(s => s.nim !== nim);
  saveData(data);
  refreshAll();
  showToast('Data berhasil dihapus.', 'success');
}

/** Reset ke data dummy. */
function resetDataset() {
  if (!confirm('Reset dataset ke data default? Semua perubahan akan hilang.')) return;
  saveData(DUMMY_DATA);
  localStorage.removeItem(LAST_OP_KEY);
  lastOpResult = null;
  clearResultDisplay();
  refreshAll();
  showToast('Dataset direset ke data default.', 'info');
}

/**
 * Submit form tambah/edit.
 */
function handleFormSubmit(e) {
  e.preventDefault();
  if (!validateForm()) return;

  const nim        = document.getElementById('fNim').value.trim();
  const nama       = document.getElementById('fNama').value.trim();
  const nilai      = parseInt(document.getElementById('fNilai').value, 10);
  const kehadiran  = parseInt(document.getElementById('fKehadiran').value, 10);
  const organisasi = document.querySelector('input[name="fOrganisasi"]:checked').value;
  const nimOri     = document.getElementById('editNimOriginal').value;

  let data = getUniverse();

  if (nimOri) {
    // Edit
    const idx = data.findIndex(s => s.nim === nimOri);
    if (idx !== -1) {
      data[idx] = { nim, nama, nilai, kehadiran, organisasi };
    }
    saveData(data);
    closeModal();
    refreshAll();
    showToast('Data berhasil diperbarui.', 'success');
  } else {
    // Tambah — cek duplikat NIM
    if (data.some(s => s.nim === nim)) {
      setFieldError('errNim', 'NIM sudah terdaftar.');
      return;
    }
    data.push({ nim, nama, nilai, kehadiran, organisasi });
    saveData(data);
    closeModal();
    refreshAll();
    showToast('Data berhasil ditambahkan.', 'success');
  }
}

/**
 * Validasi semua field form.
 * @returns {boolean}
 */
function validateForm() {
  let valid = true;
  clearFormErrors();

  const nim       = document.getElementById('fNim').value.trim();
  const nama      = document.getElementById('fNama').value.trim();
  const nilaiRaw  = document.getElementById('fNilai').value;
  const hadirRaw  = document.getElementById('fKehadiran').value;

  if (!nim) {
    setFieldError('errNim', 'NIM tidak boleh kosong.');
    valid = false;
  }
  if (!nama) {
    setFieldError('errNama', 'Nama tidak boleh kosong.');
    valid = false;
  }
  if (nilaiRaw === '' || isNaN(nilaiRaw)) {
    setFieldError('errNilai', 'Masukkan nilai.');
    valid = false;
  } else {
    const n = parseInt(nilaiRaw, 10);
    if (n < 0 || n > 100) {
      setFieldError('errNilai', 'Nilai harus antara 0–100.');
      valid = false;
    }
  }
  if (hadirRaw === '' || isNaN(hadirRaw)) {
    setFieldError('errKehadiran', 'Masukkan kehadiran.');
    valid = false;
  } else {
    const h = parseInt(hadirRaw, 10);
    if (h < 0 || h > 100) {
      setFieldError('errKehadiran', 'Kehadiran harus antara 0–100.');
      valid = false;
    }
  }

  return valid;
}

function setFieldError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
  // Mapping eksplisit error id → input id
  const inputMap = {
    errNim:      'fNim',
    errNama:     'fNama',
    errNilai:    'fNilai',
    errKehadiran:'fKehadiran'
  };
  const inp = document.getElementById(inputMap[id]);
  if (inp) inp.classList.add('error');
}

function clearFormErrors() {
  ['errNim','errNama','errNilai','errKehadiran'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
  ['fNim','fNama','fNilai','fKehadiran'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('error');
  });
}

function clearForm() {
  document.getElementById('dataForm').reset();
  clearFormErrors();
  // default radio
  document.querySelector('input[name="fOrganisasi"][value="Tidak"]').checked = true;
}

/* ================================================
   11. EXPORT CSV
================================================ */

/**
 * Export data array ke file CSV dan trigger download.
 */
function exportCSV(dataArr, filename) {
  if (!dataArr || dataArr.length === 0) {
    showToast('Tidak ada data untuk diekspor.', 'error');
    return;
  }

  const header = ['NIM', 'Nama', 'Nilai', 'Organisasi', 'Kehadiran (%)'];
  const rows   = dataArr.map(s =>
    [s.nim, s.nama, s.nilai, s.organisasi, s.kehadiran]
      .map(v => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  );

  const csvContent = [header.join(','), ...rows].join('\r\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);

  const a       = document.createElement('a');
  a.href        = url;
  a.download    = filename || 'export.csv';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(`CSV "${filename}" berhasil diekspor.`, 'success');
}

/* ================================================
   12. COPY HASIL
================================================ */

function copyResult() {
  if (!lastOpResult || lastOpResult.members.length === 0) {
    showToast('Tidak ada data untuk disalin.', 'error');
    return;
  }
  const lines = [`${lastOpResult.formula} — ${lastOpResult.members.length} mahasiswa`, ''];
  lastOpResult.members.forEach((s, i) => {
    lines.push(`${i + 1}. ${s.nim} — ${s.nama} — Nilai: ${s.nilai} — Org: ${s.organisasi} — Hadir: ${s.kehadiran}%`);
  });
  navigator.clipboard.writeText(lines.join('\n'))
    .then(() => showToast('Hasil disalin ke clipboard.', 'success'))
    .catch(() => showToast('Gagal menyalin. Coba manual.', 'error'));
}

/* ================================================
   13. CLEAR HASIL
================================================ */

function clearResultDisplay() {
  lastOpResult = null;
  // Tampilkan placeholder kembali
  document.getElementById('resultPlaceholder').style.display = '';
  // Sembunyikan hasil
  const rc = document.getElementById('resultContent');
  rc.classList.add('hidden');
  rc.style.display = '';
}

/* ================================================
   14. MODAL HELPERS
================================================ */

function openModal() {
  document.getElementById('modalOverlay').classList.add('active');
  setTimeout(() => document.getElementById('fNim').focus(), 100);
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

/* ================================================
   15. TOAST NOTIFICATION
================================================ */

/**
 * Tampilkan toast notification.
 * @param {string} msg
 * @param {'success'|'error'|'info'} type
 */
function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast     = document.createElement('div');
  toast.className = `toast toast--${type}`;

  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${escHtml(msg)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast--out');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, 3000);
}

/* ================================================
   16. NAVIGASI
================================================ */

/**
 * Navigasi ke halaman tertentu.
 */
function navigateTo(page) {
  // Sembunyikan semua halaman
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item, .bottom-nav-item').forEach(n => n.classList.remove('active'));

  // Tampilkan halaman tujuan
  const el = document.getElementById(`page-${page}`);
  if (el) el.classList.add('active');

  // Aktifkan nav item
  document.querySelectorAll(`[data-page="${page}"]`).forEach(n => n.classList.add('active'));

  // Update judul topbar
  const titles = {
    dashboard: 'Dashboard',
    dataset:   'Dataset',
    himpunan:  'Himpunan',
    operasi:   'Operasi Himpunan',
    tentang:   'Tentang'
  };
  document.getElementById('pageTitle').textContent = titles[page] || page;

  currentPage = page;

  // Render konten sesuai halaman
  if (page === 'dashboard') updateDashboard();
  if (page === 'dataset')   renderDataset();
  if (page === 'himpunan')  renderSets();

  // Tutup sidebar di mobile
  closeSidebar();
}

/* ================================================
   17. SIDEBAR MOBILE
================================================ */

function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('overlay').classList.add('active');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('active');
}

/* ================================================
   18. REFRESH SEMUA KOMPONEN
================================================ */

function refreshAll() {
  updateDashboard();
  if (currentPage === 'dataset')   renderDataset();
  if (currentPage === 'himpunan')  renderSets();
  // Jika hasil operasi sedang ditampilkan, perbarui
  if (lastOpResult && currentPage === 'operasi') renderResult();
}

/* ================================================
   19. UTILITAS
================================================ */

/** Escape karakter HTML untuk mencegah XSS. */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ================================================
   20. INISIALISASI & EVENT LISTENERS
================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* --- Navigasi sidebar & bottom nav --- */
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(el.dataset.page);
    });
  });

  /* --- Hamburger & overlay --- */
  document.getElementById('hamburger').addEventListener('click', openSidebar);
  document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
  document.getElementById('overlay').addEventListener('click', closeSidebar);

  /* --- Tombol tambah data --- */
  document.getElementById('btnAddData').addEventListener('click', openAddModal);

  /* --- Tombol reset --- */
  document.getElementById('btnReset').addEventListener('click', resetDataset);

  /* --- Form submit --- */
  document.getElementById('dataForm').addEventListener('submit', handleFormSubmit);

  /* --- Tutup modal --- */
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('btnModalCancel').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });

  /* --- Search --- */
  document.getElementById('searchInput').addEventListener('input', e => {
    searchQuery = e.target.value.trim();
    renderDataset();
  });

  /* --- Filter --- */
  document.getElementById('filterSelect').addEventListener('change', e => {
    filterValue = e.target.value;
    renderDataset();
  });

  /* --- Operasi: ubah jenis operasi → toggle input --- */
  document.getElementById('opSelect').addEventListener('change', e => {
    const isComplement = e.target.value === 'complement';
    document.getElementById('opInputsTwoSet').classList.toggle('hidden', isComplement);
    document.getElementById('opInputsOneSet').classList.toggle('hidden', !isComplement);

    // Update simbol
    document.getElementById('opSymbolDisplay').textContent = OP_SYMBOLS[e.target.value] || '∪';
  });

  /* --- Jalankan operasi --- */
  document.getElementById('btnRunOp').addEventListener('click', runOperation);

  /* --- Copy hasil --- */
  document.getElementById('btnCopy').addEventListener('click', copyResult);

  /* --- Export CSV hasil operasi --- */
  document.getElementById('btnExportCSV').addEventListener('click', () => {
    if (!lastOpResult) return;
    const fname = `SetClassify_${lastOpResult.formula.replace(/[^A-Za-z0-9]/g, '_')}.csv`;
    exportCSV(lastOpResult.members, fname);
  });

  /* --- Clear hasil --- */
  document.getElementById('btnClearResult').addEventListener('click', () => {
    clearResultDisplay();
    showToast('Hasil dihapus.', 'info');
  });

  /* --- Tombol "Kelola Dataset" di dashboard --- */
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.nav));
  });

  /* --- Tutup modal dengan tombol Escape --- */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  /* ---- INISIALISASI AWAL ---- */
  // Pastikan data dummy tersedia jika belum ada
  loadData();

  // Render halaman awal
  navigateTo('dashboard');
});
