/* ================================================
   SetClassify — script.js
   PJBL-2 Sesi 2: Operasi Himpunan & Diagram Venn
   Matematika Diskrit
================================================ */

'use strict';

/* ================================================
   1. KONSTANTA & KONFIGURASI
================================================ */
const STORAGE_KEY   = 'setclassify_dataset';
const STORAGE_DS    = 'setclassify_active_ds';   // '1' atau '2'
const LAST_OP_KEY   = 'setclassify_last_op';
const DATA_VERSION  = 'v4';  // dinaikkan agar localStorage lama ter-reset
const VERSION_KEY   = 'setclassify_version';

// Simbol per operasi
const OP_SYMBOLS = {
  union:          '∪',
  union3:         '∪',
  intersection:   '∩',
  intersection3:  '∩',
  difference_ab:  '−',
  difference_ba:  '−',
  complement:     'ᶜ'
};

// Tooltip / penjelasan per operasi
const OP_TOOLTIPS = {
  union:         'Union: Gabungan semua anggota dari himpunan yang dipilih tanpa duplikasi.',
  union3:        'Union 3 Himpunan: Gabungan semua anggota dari A, B, dan C tanpa duplikasi.',
  intersection:  'Intersection: Anggota yang terdapat pada semua himpunan yang dipilih.',
  intersection3: 'Intersection 3 Himpunan: Anggota yang terdapat sekaligus di A, B, dan C.',
  difference_ab: 'Difference A − B: Anggota yang ada di himpunan pertama tetapi tidak ada di himpunan kedua.',
  difference_ba: 'Difference B − A: Anggota yang ada di himpunan kedua tetapi tidak ada di himpunan pertama.',
  complement:    'Complement: Anggota Universal Set U yang tidak termasuk dalam himpunan yang dipilih.'
};

/* ================================================
   2. DATASET 1 — Mahasiswa (20 data bervariasi)
   Dirancang agar semua region irisan terisi
================================================ */
const DATASET1 = [
  // A∩B∩C (nilai≥80, org=Ya, hadir≥80)
  { nim:'25210005', nama:'Okta Satria',             nilai:90, organisasi:'Ya', kehadiran:92 },
  { nim:'25210469', nama:'Tara Tursina',            nilai:85, organisasi:'Ya', kehadiran:88 },
  { nim:'25210129', nama:'Kurnia Haidar',           nilai:88, organisasi:'Ya', kehadiran:85 },
  // A∩B only (nilai≥80, org=Ya, hadir<80)
  { nim:'25210395', nama:'Muhammad Rezky Syawalli', nilai:82, organisasi:'Ya', kehadiran:75 },
  { nim:'25210099', nama:'Nisaul Husna',            nilai:80, organisasi:'Ya', kehadiran:70 },
  // A∩C only (nilai≥80, org=Tidak, hadir≥80)
  { nim:'25210055', nama:'Diola Humaira',           nilai:91, organisasi:'Tidak', kehadiran:90 },
  { nim:'25210451', nama:'Kelvin Faturi Zayyan',    nilai:83, organisasi:'Tidak', kehadiran:82 },
  // B∩C only (nilai<80, org=Ya, hadir≥80)
  { nim:'25210355', nama:'M. Subhan',               nilai:72, organisasi:'Ya', kehadiran:86 },
  { nim:'25210210', nama:'Rizal Maulana',           nilai:68, organisasi:'Ya', kehadiran:81 },
  // A only (nilai≥80, org=Tidak, hadir<80)
  { nim:'25210311', nama:'Sinta Dewi',              nilai:84, organisasi:'Tidak', kehadiran:72 },
  { nim:'25210422', nama:'Fahmi Ramadhan',          nilai:86, organisasi:'Tidak', kehadiran:65 },
  // B only (nilai<80, org=Ya, hadir<80)
  { nim:'25210133', nama:'Anisa Putri',             nilai:74, organisasi:'Ya', kehadiran:70 },
  { nim:'25210244', nama:'Dimas Aditya',            nilai:65, organisasi:'Ya', kehadiran:68 },
  // C only (nilai<80, org=Tidak, hadir≥80)
  { nim:'25210366', nama:'Lutfi Hakim',             nilai:73, organisasi:'Tidak', kehadiran:85 },
  { nim:'25210477', nama:'Wulan Sari',              nilai:70, organisasi:'Tidak', kehadiran:88 },
  // Tidak di A/B/C
  { nim:'25210188', nama:'Budi Santoso',            nilai:55, organisasi:'Tidak', kehadiran:60 },
  { nim:'25210299', nama:'Citra Lestari',           nilai:60, organisasi:'Tidak', kehadiran:75 },
  { nim:'25210300', nama:'Eko Prasetyo',            nilai:75, organisasi:'Tidak', kehadiran:78 },
  { nim:'25210401', nama:'Fitri Andriani',          nilai:62, organisasi:'Tidak', kehadiran:55 },
  { nim:'25210502', nama:'Gilang Permana',          nilai:58, organisasi:'Tidak', kehadiran:50 }
];

/* ================================================
   3. DATASET 2 — Peserta Kegiatan Kampus
   A = Seminar Teknologi
   B = Workshop Pemrograman
   C = Kompetisi IT
================================================ */
const DATASET2 = [
  // A∩B∩C
  { nim:'KP001', nama:'Aldi Firmansyah',   nilai:85, organisasi:'Ya', kehadiran:90, seminar:'Ya', workshop:'Ya', kompetisi:'Ya' },
  { nim:'KP002', nama:'Bella Safitri',     nilai:80, organisasi:'Ya', kehadiran:88, seminar:'Ya', workshop:'Ya', kompetisi:'Ya' },
  { nim:'KP003', nama:'Cahya Nugraha',     nilai:78, organisasi:'Ya', kehadiran:85, seminar:'Ya', workshop:'Ya', kompetisi:'Ya' },
  // A∩B only
  { nim:'KP004', nama:'Dinda Amalia',      nilai:72, organisasi:'Ya', kehadiran:70, seminar:'Ya', workshop:'Ya', kompetisi:'Tidak' },
  { nim:'KP005', nama:'Erwin Saputra',     nilai:68, organisasi:'Ya', kehadiran:65, seminar:'Ya', workshop:'Ya', kompetisi:'Tidak' },
  // A∩C only
  { nim:'KP006', nama:'Farida Hanum',      nilai:75, organisasi:'Tidak', kehadiran:82, seminar:'Ya', workshop:'Tidak', kompetisi:'Ya' },
  { nim:'KP007', nama:'Gilang Wibowo',     nilai:70, organisasi:'Tidak', kehadiran:80, seminar:'Ya', workshop:'Tidak', kompetisi:'Ya' },
  // B∩C only
  { nim:'KP008', nama:'Hani Rahmawati',    nilai:65, organisasi:'Tidak', kehadiran:86, seminar:'Tidak', workshop:'Ya', kompetisi:'Ya' },
  { nim:'KP009', nama:'Irfan Hidayat',     nilai:60, organisasi:'Tidak', kehadiran:83, seminar:'Tidak', workshop:'Ya', kompetisi:'Ya' },
  // A only
  { nim:'KP010', nama:'Jasmine Aulia',     nilai:88, organisasi:'Tidak', kehadiran:60, seminar:'Ya', workshop:'Tidak', kompetisi:'Tidak' },
  { nim:'KP011', nama:'Kevin Rizaldi',     nilai:82, organisasi:'Tidak', kehadiran:55, seminar:'Ya', workshop:'Tidak', kompetisi:'Tidak' },
  // B only
  { nim:'KP012', nama:'Laila Nur',         nilai:58, organisasi:'Ya', kehadiran:60, seminar:'Tidak', workshop:'Ya', kompetisi:'Tidak' },
  { nim:'KP013', nama:'Maulana Akbar',     nilai:55, organisasi:'Ya', kehadiran:58, seminar:'Tidak', workshop:'Ya', kompetisi:'Tidak' },
  // C only
  { nim:'KP014', nama:'Nadia Kusuma',      nilai:62, organisasi:'Tidak', kehadiran:90, seminar:'Tidak', workshop:'Tidak', kompetisi:'Ya' },
  { nim:'KP015', nama:'Oscar Pratama',     nilai:60, organisasi:'Tidak', kehadiran:87, seminar:'Tidak', workshop:'Tidak', kompetisi:'Ya' },
  // Tidak di A/B/C
  { nim:'KP016', nama:'Putri Rahayu',      nilai:50, organisasi:'Tidak', kehadiran:50, seminar:'Tidak', workshop:'Tidak', kompetisi:'Tidak' },
  { nim:'KP017', nama:'Qori Ananda',       nilai:45, organisasi:'Tidak', kehadiran:48, seminar:'Tidak', workshop:'Tidak', kompetisi:'Tidak' },
  { nim:'KP018', nama:'Rendi Saputra',     nilai:52, organisasi:'Tidak', kehadiran:52, seminar:'Tidak', workshop:'Tidak', kompetisi:'Tidak' },
  { nim:'KP019', nama:'Sari Wulandari',    nilai:48, organisasi:'Tidak', kehadiran:45, seminar:'Tidak', workshop:'Tidak', kompetisi:'Tidak' },
  { nim:'KP020', nama:'Tomy Harisanto',    nilai:55, organisasi:'Tidak', kehadiran:55, seminar:'Tidak', workshop:'Tidak', kompetisi:'Tidak' }
];

/* ================================================
   4. KONFIGURASI DATASET
   Mendefinisikan kriteria, label, dan properti tiap dataset
================================================ */
const DS_CONFIG = {
  1: {
    name: 'Dataset 1',
    label: 'Mahasiswa',
    titleA: 'Himpunan A — Nilai Tinggi',
    titleB: 'Himpunan B — Aktif Organisasi',
    titleC: 'Himpunan C — Kehadiran Tinggi',
    criteriaA: 'Kriteria: Nilai ≥ 80',
    criteriaB: 'Kriteria: Status Organisasi = Ya',
    criteriaC: 'Kriteria: Kehadiran ≥ 80%',
    criteriaU: 'Seluruh mahasiswa dalam dataset',
    labelA: 'Nilai Tinggi (≥80)',
    labelB: 'Aktif Organisasi',
    labelC: 'Kehadiran Tinggi (≥80%)',
    filterA: s => s.nilai >= 80,
    filterB: s => s.organisasi === 'Ya',
    filterC: s => s.kehadiran >= 80,
    idKey:   'nim',
    data:    DATASET1,
    colOrg:  'Organisasi',
    memberDetail: s => `Nilai: ${s.nilai} | Hadir: ${s.kehadiran}%`
  },
  2: {
    name: 'Dataset 2',
    label: 'Peserta Kegiatan Kampus',
    titleA: 'Himpunan A — Seminar Teknologi',
    titleB: 'Himpunan B — Workshop Pemrograman',
    titleC: 'Himpunan C — Kompetisi IT',
    criteriaA: 'Kriteria: Peserta Seminar Teknologi',
    criteriaB: 'Kriteria: Peserta Workshop Pemrograman',
    criteriaC: 'Kriteria: Peserta Kompetisi IT',
    criteriaU: 'Seluruh peserta kegiatan kampus',
    labelA: 'Seminar Teknologi',
    labelB: 'Workshop Pemrograman',
    labelC: 'Kompetisi IT',
    filterA: s => s.seminar === 'Ya',
    filterB: s => s.workshop === 'Ya',
    filterC: s => s.kompetisi === 'Ya',
    idKey:   'nim',
    data:    DATASET2,
    colOrg:  'Org./Kegiatan',
    memberDetail: s => `Seminar: ${s.seminar} | Workshop: ${s.workshop} | Kompetisi: ${s.kompetisi}`
  }
};

/* ================================================
   5. STATE APLIKASI
================================================ */
let currentPage    = 'dashboard';
let lastOpResult   = null;
let searchQuery    = '';
let filterValue    = 'all';
let activeDataset  = 1;  // 1 atau 2

/* ================================================
   6. PENYIMPANAN DATA (localStorage)
================================================ */

function saveData(dataset) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataset));
}

function loadData() {
  const storedVersion = localStorage.getItem(VERSION_KEY);
  if (storedVersion !== DATA_VERSION) {
    localStorage.setItem(VERSION_KEY, DATA_VERSION);
    localStorage.removeItem(LAST_OP_KEY);
    localStorage.removeItem(STORAGE_DS);
    saveData(DS_CONFIG[1].data);
    return [...DS_CONFIG[1].data];
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* data rusak */ }
  }
  saveData(DS_CONFIG[activeDataset].data);
  return [...DS_CONFIG[activeDataset].data];
}

function saveLastOp(info) {
  localStorage.setItem(LAST_OP_KEY, JSON.stringify(info));
}

function loadLastOp() {
  const raw = localStorage.getItem(LAST_OP_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

/* ================================================
   7. DATASET SWITCHER
================================================ */

/**
 * Ganti dataset aktif (1 atau 2).
 * Semua render ulang secara otomatis.
 */
function switchDataset(dsNum) {
  activeDataset = dsNum;
  localStorage.setItem(STORAGE_DS, String(dsNum));
  // Muat data default dataset baru ke localStorage
  saveData(DS_CONFIG[dsNum].data);
  // Reset hasil operasi lama
  lastOpResult = null;
  localStorage.removeItem(LAST_OP_KEY);
  clearResultDisplay();

  // Update tombol switcher
  document.querySelectorAll('.ds-btn').forEach(b => {
    b.classList.toggle('active', Number(b.dataset.ds) === dsNum);
  });

  // Update label ringkasan himpunan di dashboard
  updateSetSummaryLabels();

  // Refresh semua tampilan
  refreshAll();

  // Re-render Venn & PIE kalau sedang di halaman tersebut
  if (currentPage === 'venn') renderFullVenn();
  if (currentPage === 'pie')  { /* biarkan user klik hitung ulang */ clearPieResults(); }

  showToast(`Beralih ke ${DS_CONFIG[dsNum].name}: ${DS_CONFIG[dsNum].label}`, 'info');
}

/** Update label ringkasan A/B/C di sidebar dashboard sesuai dataset aktif */
function updateSetSummaryLabels() {
  const cfg = DS_CONFIG[activeDataset];
  document.getElementById('summA').textContent = cfg.labelA;
  document.getElementById('summB').textContent = cfg.labelB;
  document.getElementById('summC').textContent = cfg.labelC;
  document.getElementById('summU').textContent = 'Semesta — ' + cfg.label;
  document.getElementById('dashDatasetLabel').textContent = `${cfg.name}: ${cfg.label}`;

  // Himpunan page
  document.getElementById('setTitleA').textContent = cfg.titleA;
  document.getElementById('setTitleB').textContent = cfg.titleB;
  document.getElementById('setTitleC').textContent = cfg.titleC;
  document.getElementById('criteriaA').textContent = cfg.criteriaA;
  document.getElementById('criteriaB').textContent = cfg.criteriaB;
  document.getElementById('criteriaC').textContent = cfg.criteriaC;
  document.getElementById('criteriaU').textContent = cfg.criteriaU;
  document.getElementById('himpunanPageDesc').textContent =
    `Data ${cfg.label} diklasifikasikan ke dalam himpunan berdasarkan kriteria.`;
  document.getElementById('datasetPageDesc').textContent =
    `Kelola data ${cfg.label} (${cfg.name}) — semesta himpunan.`;

  // Result table header
  const colOrg = document.getElementById('resultColOrg');
  if (colOrg) colOrg.textContent = cfg.colOrg;
}

/* ================================================
   8. PEMBENTUKAN HIMPUNAN
================================================ */

function getUniverse() {
  return loadData();
}

function getSetA() {
  return getUniverse().filter(DS_CONFIG[activeDataset].filterA);
}

function getSetB() {
  return getUniverse().filter(DS_CONFIG[activeDataset].filterB);
}

function getSetC() {
  return getUniverse().filter(DS_CONFIG[activeDataset].filterC);
}

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
   9. OPERASI HIMPUNAN (logika matematika)
   Identifier unik: nim
================================================ */

/** Union A ∪ B — gabungan tanpa duplikasi */
function union(setA, setB) {
  const map = new Map();
  [...setA, ...setB].forEach(s => map.set(s.nim, s));
  return [...map.values()];
}

/** Union 3 himpunan A ∪ B ∪ C */
function union3(setA, setB, setC) {
  return union(union(setA, setB), setC);
}

/** Intersection A ∩ B */
function intersection(setA, setB) {
  const nimB = new Set(setB.map(s => s.nim));
  return setA.filter(s => nimB.has(s.nim));
}

/** Intersection 3 himpunan A ∩ B ∩ C */
function intersection3(setA, setB, setC) {
  return intersection(intersection(setA, setB), setC);
}

/** Difference A − B */
function difference(setA, setB) {
  const nimB = new Set(setB.map(s => s.nim));
  return setA.filter(s => !nimB.has(s.nim));
}

/** Complement Aᶜ = U − A */
function complement(setA, universe) {
  const nimA = new Set(setA.map(s => s.nim));
  return universe.filter(s => !nimA.has(s.nim));
}

/* ================================================
   10. PRINSIP INKLUSI-EKSKLUSI
================================================ */

/**
 * Hitung PIE untuk 2 himpunan.
 * Mengembalikan objek dengan semua nilai intermediate.
 */
function calculatePIE2(setX, setY) {
  const inter = intersection(setX, setY);
  const unionDirect = union(setX, setY);

  const sizeX     = setX.length;
  const sizeY     = setY.length;
  const sizeXY    = inter.length;
  const piResult  = sizeX + sizeY - sizeXY;

  return {
    sizeX, sizeY, sizeXY,
    piResult,
    directCount: unionDirect.length,
    valid: piResult === unionDirect.length,
    inter,
    unionDirect
  };
}

/**
 * Hitung PIE untuk 3 himpunan A, B, C.
 */
function calculatePIE3(setA, setB, setC) {
  const interAB  = intersection(setA, setB);
  const interAC  = intersection(setA, setC);
  const interBC  = intersection(setB, setC);
  const interABC = intersection3(setA, setB, setC);
  const unionDir = union3(setA, setB, setC);

  const sA   = setA.length;
  const sB   = setB.length;
  const sC   = setC.length;
  const sAB  = interAB.length;
  const sAC  = interAC.length;
  const sBC  = interBC.length;
  const sABC = interABC.length;

  const piResult = sA + sB + sC - sAB - sAC - sBC + sABC;

  return {
    sA, sB, sC,
    sAB, sAC, sBC, sABC,
    piResult,
    directCount: unionDir.length,
    valid: piResult === unionDir.length,
    interAB, interAC, interBC, interABC,
    unionDir
  };
}

/* ================================================
   11. VENN DIAGRAM REGIONS
   Menghitung 7 region untuk diagram Venn 3 set
================================================ */

/**
 * Mengembalikan 7 region Venn untuk A, B, C.
 * onlyA = A saja (tidak di B/C)
 * onlyB = B saja
 * onlyC = C saja
 * ab    = A∩B saja (tidak di C)
 * ac    = A∩C saja (tidak di B)
 * bc    = B∩C saja (tidak di A)
 * abc   = A∩B∩C
 */
function getVennRegions(setA, setB, setC) {
  const nimB   = new Set(setB.map(s => s.nim));
  const nimC   = new Set(setC.map(s => s.nim));
  const nimA   = new Set(setA.map(s => s.nim));

  const abc  = setA.filter(s => nimB.has(s.nim) && nimC.has(s.nim));
  const ab   = setA.filter(s => nimB.has(s.nim) && !nimC.has(s.nim));
  const ac   = setA.filter(s => nimC.has(s.nim) && !nimB.has(s.nim));
  const bc   = setB.filter(s => nimC.has(s.nim) && !nimA.has(s.nim));
  const onlyA = setA.filter(s => !nimB.has(s.nim) && !nimC.has(s.nim));
  const onlyB = setB.filter(s => !nimA.has(s.nim) && !nimC.has(s.nim));
  const onlyC = setC.filter(s => !nimA.has(s.nim) && !nimB.has(s.nim));

  return { onlyA, onlyB, onlyC, ab, ac, bc, abc };
}

/* ================================================
   12. RENDER HELPERS
================================================ */

function getMemberships(student) {
  const cfg = DS_CONFIG[activeDataset];
  const m = [];
  if (cfg.filterA(student)) m.push('A');
  if (cfg.filterB(student)) m.push('B');
  if (cfg.filterC(student)) m.push('C');
  return m;
}

function renderChips(student) {
  const m = getMemberships(student);
  if (m.length === 0) return `<span class="chip chip--none">—</span>`;
  return m.map(x => `<span class="chip chip--${x.toLowerCase()}">${x}</span>`).join('');
}

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

function renderDataset() {
  let data = getUniverse();

  if (filterValue !== 'all') {
    if (filterValue === 'none') {
      data = data.filter(s => getMemberships(s).length === 0);
    } else {
      data = data.filter(s => getMemberships(s).includes(filterValue));
    }
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    data = data.filter(s =>
      s.nim.toLowerCase().includes(q) ||
      s.nama.toLowerCase().includes(q)
    );
  }

  const tbody = document.getElementById('dataTableBody');
  const empty = document.getElementById('tableEmpty');
  const info  = document.getElementById('tableInfo');

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

function renderMemberItem(student, detail) {
  return `
    <div class="member-item">
      <span class="member-nim">${escHtml(student.nim)}</span>
      <span class="member-name">${escHtml(student.nama)}</span>
      <span class="member-detail">${detail}</span>
    </div>`;
}

function renderSets() {
  const U   = getUniverse();
  const A   = getSetA();
  const B   = getSetB();
  const C   = getSetC();
  const cfg = DS_CONFIG[activeDataset];

  document.getElementById('setCountU').textContent = U.length;
  document.getElementById('setCountA').textContent = A.length;
  document.getElementById('setCountB').textContent = B.length;
  document.getElementById('setCountC').textContent = C.length;

  const elU = document.getElementById('setMembersU');
  const elA = document.getElementById('setMembersA');
  const elB = document.getElementById('setMembersB');
  const elC = document.getElementById('setMembersC');

  const emptyHtml = '<p class="empty-text" style="padding:8px 0;font-size:12px;color:var(--clr-text-muted);">Tidak ada anggota.</p>';

  elU.innerHTML = U.length
    ? U.map(s => renderMemberItem(s, cfg.memberDetail(s))).join('')
    : '<p class="empty-text">Dataset kosong.</p>';

  elA.innerHTML = A.length
    ? A.map(s => renderMemberItem(s, `${cfg.labelA}`)).join('')
    : emptyHtml;

  elB.innerHTML = B.length
    ? B.map(s => renderMemberItem(s, `${cfg.labelB}`)).join('')
    : emptyHtml;

  elC.innerHTML = C.length
    ? C.map(s => renderMemberItem(s, `${cfg.labelC}`)).join('')
    : emptyHtml;

  // Render intersection summary
  renderIntersectionSummary(A, B, C);
}

/**
 * Render tabel ringkasan irisan himpunan di halaman Himpunan.
 */
function renderIntersectionSummary(A, B, C) {
  const r = getVennRegions(A, B, C);
  const interAB  = intersection(A, B);
  const interAC  = intersection(A, C);
  const interBC  = intersection(B, C);
  const interABC = r.abc;

  const items = [
    { label: '|A|',      count: A.length,       desc: 'Anggota Himpunan A' },
    { label: '|B|',      count: B.length,       desc: 'Anggota Himpunan B' },
    { label: '|C|',      count: C.length,       desc: 'Anggota Himpunan C' },
    { label: '|A ∩ B|',  count: interAB.length, desc: 'Ada di A dan B' },
    { label: '|A ∩ C|',  count: interAC.length, desc: 'Ada di A dan C' },
    { label: '|B ∩ C|',  count: interBC.length, desc: 'Ada di B dan C' },
    { label: '|A ∩ B ∩ C|', count: interABC.length, desc: 'Ada di A, B, dan C' },
    { label: '|A ∪ B ∪ C|', count: union3(A,B,C).length, desc: 'Gabungan unik A, B, C' }
  ];

  const el = document.getElementById('intersectionSummary');
  el.innerHTML = items.map(item => `
    <div class="isect-item">
      <span class="isect-label">${item.label}</span>
      <span class="isect-count">${item.count}</span>
      <span class="isect-desc">${item.desc}</span>
    </div>
  `).join('');
}

function updateDashboard() {
  const U = getUniverse();
  document.getElementById('statTotal').textContent = U.length;
  document.getElementById('statA').textContent     = getSetA().length;
  document.getElementById('statB').textContent     = getSetB().length;
  document.getElementById('statC').textContent     = getSetC().length;
  document.getElementById('totalBadge').textContent = `${U.length} data`;

  const op = loadLastOp();
  const el = document.getElementById('lastOpDisplay');
  if (op) {
    el.innerHTML = `
      <div class="last-op-info">
        <div class="op-name">${escHtml(op.formula)}</div>
        <div class="op-detail">${escHtml(op.title)} — ${op.count} anggota ditemukan</div>
      </div>`;
  } else {
    el.innerHTML = '<p class="empty-text">Belum ada operasi yang dijalankan.</p>';
  }

  // Quick PIE summary on dashboard
  renderDashPIE();
}

/**
 * Tampilkan ringkasan PIE 3 himpunan di dashboard.
 */
function renderDashPIE() {
  const A   = getSetA();
  const B   = getSetB();
  const C   = getSetC();
  const pie = calculatePIE3(A, B, C);
  const cfg = DS_CONFIG[activeDataset];

  const el = document.getElementById('dashPieContent');
  el.innerHTML = `
    <div class="dash-pie-grid">
      <div class="dash-pie-row">
        <span>|A| (${cfg.labelA})</span><span class="dash-pie-val">${pie.sA}</span>
      </div>
      <div class="dash-pie-row">
        <span>|B| (${cfg.labelB})</span><span class="dash-pie-val">${pie.sB}</span>
      </div>
      <div class="dash-pie-row">
        <span>|C| (${cfg.labelC})</span><span class="dash-pie-val">${pie.sC}</span>
      </div>
      <div class="dash-pie-row dash-pie-sub">
        <span>|A ∩ B|</span><span class="dash-pie-val">−${pie.sAB}</span>
      </div>
      <div class="dash-pie-row dash-pie-sub">
        <span>|A ∩ C|</span><span class="dash-pie-val">−${pie.sAC}</span>
      </div>
      <div class="dash-pie-row dash-pie-sub">
        <span>|B ∩ C|</span><span class="dash-pie-val">−${pie.sBC}</span>
      </div>
      <div class="dash-pie-row dash-pie-add">
        <span>|A ∩ B ∩ C|</span><span class="dash-pie-val">+${pie.sABC}</span>
      </div>
      <div class="dash-pie-row dash-pie-result">
        <span><strong>|A ∪ B ∪ C| (PIE)</strong></span>
        <span class="dash-pie-val"><strong>${pie.piResult}</strong></span>
      </div>
      <div class="dash-pie-row">
        <span>Status Validasi</span>
        <span class="pie-valid-badge ${pie.valid ? 'valid' : 'invalid'}">
          ${pie.valid ? '✓ Valid' : '⚠ Tidak Sesuai'}
        </span>
      </div>
    </div>`;
}

/* ================================================
   13. OPERASI HIMPUNAN — HANDLER
================================================ */

function buildOpMeta(opType, nameFirst, nameSecond) {
  const cfg = DS_CONFIG[activeDataset];
  const labelMap = {
    A: cfg.labelA,
    B: cfg.labelB,
    C: cfg.labelC,
    U: 'Semesta'
  };

  switch (opType) {
    case 'union':
      return {
        title:       `${nameFirst} ∪ ${nameSecond} — Union`,
        formula:     `${nameFirst} ∪ ${nameSecond}`,
        explanation: `Menggabungkan seluruh anggota dari Himpunan ${nameFirst} (${labelMap[nameFirst]}) dan Himpunan ${nameSecond} (${labelMap[nameSecond]}) tanpa duplikasi.`
      };
    case 'union3':
      return {
        title:       `A ∪ B ∪ C — Union 3 Himpunan`,
        formula:     `A ∪ B ∪ C`,
        explanation: `Menggabungkan seluruh anggota dari Himpunan A (${cfg.labelA}), B (${cfg.labelB}), dan C (${cfg.labelC}) tanpa duplikasi.`
      };
    case 'intersection':
      return {
        title:       `${nameFirst} ∩ ${nameSecond} — Intersection`,
        formula:     `${nameFirst} ∩ ${nameSecond}`,
        explanation: `Menampilkan anggota yang sekaligus memenuhi kriteria Himpunan ${nameFirst} (${labelMap[nameFirst]}) dan Himpunan ${nameSecond} (${labelMap[nameSecond]}).`
      };
    case 'intersection3':
      return {
        title:       `A ∩ B ∩ C — Intersection 3 Himpunan`,
        formula:     `A ∩ B ∩ C`,
        explanation: `Menampilkan anggota yang sekaligus ada di Himpunan A (${cfg.labelA}), B (${cfg.labelB}), dan C (${cfg.labelC}).`
      };
    case 'difference_ab':
      return {
        title:       `${nameFirst} − ${nameSecond} — Difference`,
        formula:     `${nameFirst} − ${nameSecond}`,
        explanation: `Menampilkan anggota yang ada di Himpunan ${nameFirst} (${labelMap[nameFirst]}) tetapi tidak ada di Himpunan ${nameSecond} (${labelMap[nameSecond]}).`
      };
    case 'difference_ba':
      return {
        title:       `${nameSecond} − ${nameFirst} — Difference`,
        formula:     `${nameSecond} − ${nameFirst}`,
        explanation: `Menampilkan anggota yang ada di Himpunan ${nameSecond} (${labelMap[nameSecond]}) tetapi tidak ada di Himpunan ${nameFirst} (${labelMap[nameFirst]}).`
      };
    case 'complement':
      return {
        title:       `${nameFirst}ᶜ — Complement`,
        formula:     `${nameFirst}ᶜ`,
        explanation: `Menampilkan anggota Semesta U yang tidak masuk dalam Himpunan ${nameFirst} (${labelMap[nameFirst]}). Rumus: ${nameFirst}ᶜ = U − ${nameFirst}`
      };
    default:
      return { title: '—', formula: '—', explanation: '—' };
  }
}

function runOperation() {
  const opType = document.getElementById('opSelect').value;
  const U      = getUniverse();

  if (U.length === 0) {
    showToast('Dataset kosong. Tambah data terlebih dahulu.', 'error');
    return;
  }

  let resultMembers = [];
  let nameFirst = 'A', nameSecond = 'B';

  if (opType === 'complement') {
    nameFirst     = document.getElementById('setComplement').value;
    const setFirst = getSetByCode(nameFirst);
    resultMembers  = complement(setFirst, U);
    nameSecond     = 'U';

  } else if (opType === 'union3' || opType === 'intersection3') {
    const A = getSetA(), B = getSetB(), C = getSetC();
    resultMembers = opType === 'union3'
      ? union3(A, B, C)
      : intersection3(A, B, C);

  } else {
    nameFirst  = document.getElementById('setFirst').value;
    nameSecond = document.getElementById('setSecond').value;
    const setFirst  = getSetByCode(nameFirst);
    const setSecond = getSetByCode(nameSecond);

    switch (opType) {
      case 'union':         resultMembers = union(setFirst, setSecond);        break;
      case 'intersection':  resultMembers = intersection(setFirst, setSecond); break;
      case 'difference_ab': resultMembers = difference(setFirst, setSecond);   break;
      case 'difference_ba': resultMembers = difference(setSecond, setFirst);   break;
    }
  }

  const meta = buildOpMeta(opType, nameFirst, nameSecond);

  lastOpResult = {
    title:      meta.title,
    formula:    meta.formula,
    explanation:meta.explanation,
    members:    resultMembers,
    opType,
    nameFirst,
    nameSecond
  };

  saveLastOp({ title: meta.title, formula: meta.formula, count: resultMembers.length });
  renderResult();
  updateDashboard();
  showToast(`Operasi ${meta.formula} berhasil — ${resultMembers.length} anggota ditemukan.`, 'success');
}

function renderResult() {
  if (!lastOpResult) return;

  const { title, formula, explanation, members } = lastOpResult;

  document.getElementById('resultPlaceholder').style.display = 'none';
  const resultContent = document.getElementById('resultContent');
  resultContent.classList.remove('hidden');
  resultContent.style.display = '';

  document.getElementById('resultTitle').textContent       = title;
  document.getElementById('resultFormula').textContent     = formula;
  document.getElementById('resultExplanation').textContent = explanation;
  document.getElementById('resultCount').textContent       = `${members.length} anggota`;

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

  // Render Diagram Venn inline di hasil operasi
  renderVennInline(lastOpResult);
}

/* ================================================
   14. DIAGRAM VENN — INLINE (di halaman Operasi)
================================================ */

function renderVennInline(opResult) {
  const container = document.getElementById('vennDiagram');
  const { opType } = opResult;

  if (opType === 'complement') {
    container.innerHTML = renderVennComplement(opResult);
  } else if (opType === 'union3' || opType === 'intersection3') {
    // Untuk operasi 3 himpunan, tampilkan diagram Venn 3 set
    const A = getSetA(), B = getSetB(), C = getSetC();
    container.innerHTML = renderVennThreeSets(A, B, C, opResult.members, opType);
  } else {
    container.innerHTML = renderVennTwoSets(opResult);
  }
}

/**
 * Diagram Venn 2 himpunan — dengan highlight region hasil operasi.
 */
function renderVennTwoSets(opResult) {
  const { opType, nameFirst, nameSecond, members } = opResult;

  const setFirst  = getSetByCode(nameFirst);
  const setSecond = getSetByCode(nameSecond);
  const inter     = intersection(setFirst, setSecond);
  const onlyFirst = difference(setFirst, setSecond);
  const onlySecond= difference(setSecond, setFirst);

  const colorMap = { A:'#f97316', B:'#10b981', C:'#8b5cf6', U:'#94a3b8' };
  const c1 = colorMap[nameFirst]  || '#f97316';
  const c2 = colorMap[nameSecond] || '#10b981';

  const resultNims  = new Set(members.map(s => s.nim));
  const hlLeft  = onlyFirst.some(s  => resultNims.has(s.nim));
  const hlMid   = inter.some(s      => resultNims.has(s.nim));
  const hlRight = onlySecond.some(s => resultNims.has(s.nim));

  const uid = Date.now();

  return `
  <svg viewBox="0 0 440 210" xmlns="http://www.w3.org/2000/svg" width="440" height="210" role="img" aria-label="Diagram Venn 2 himpunan">
    <rect x="8" y="8" width="424" height="194" rx="10" fill="#1a1d27" stroke="rgba(255,255,255,.08)" stroke-width="1.5"/>
    <text x="22" y="30" font-family="Inter,Segoe UI,sans-serif" font-size="11" fill="#64748b" font-weight="700">U (${getUniverse().length})</text>

    <circle cx="165" cy="105" r="75" fill="${c1}" fill-opacity=".12" stroke="${c1}" stroke-width="2"/>
    <circle cx="275" cy="105" r="75" fill="${c2}" fill-opacity=".12" stroke="${c2}" stroke-width="2"/>

    <!-- Highlight only-left -->
    <clipPath id="cL${uid}"><circle cx="165" cy="105" r="75"/></clipPath>
    <circle cx="165" cy="105" r="75" fill="${hlLeft ? c1 : 'none'}" fill-opacity="${hlLeft ? '.40' : '0'}" clip-path="url(#cL${uid})"/>
    <circle cx="275" cy="105" r="75" fill="${hlLeft ? '#1a1d27' : 'none'}" fill-opacity="${hlLeft ? '.75' : '0'}" clip-path="url(#cL${uid})"/>

    <!-- Highlight only-right -->
    <clipPath id="cR${uid}"><circle cx="275" cy="105" r="75"/></clipPath>
    <circle cx="275" cy="105" r="75" fill="${hlRight ? c2 : 'none'}" fill-opacity="${hlRight ? '.40' : '0'}" clip-path="url(#cR${uid})"/>
    <circle cx="165" cy="105" r="75" fill="${hlRight ? '#1a1d27' : 'none'}" fill-opacity="${hlRight ? '.75' : '0'}" clip-path="url(#cR${uid})"/>

    <!-- Highlight intersection -->
    <clipPath id="cI${uid}"><circle cx="165" cy="105" r="75"/></clipPath>
    <circle cx="275" cy="105" r="75" fill="${hlMid ? '#6366f1' : 'none'}" fill-opacity="${hlMid ? '.55' : '0'}" clip-path="url(#cI${uid})"/>

    <!-- Labels -->
    <text x="115" y="99" font-family="Inter,Segoe UI,sans-serif" font-size="16" font-weight="700" fill="${c1}" text-anchor="middle">${escHtml(nameFirst)}</text>
    <text x="115" y="117" font-family="Inter,Segoe UI,sans-serif" font-size="12" fill="#64748b" text-anchor="middle">${onlyFirst.length}</text>

    <text x="325" y="99" font-family="Inter,Segoe UI,sans-serif" font-size="16" font-weight="700" fill="${c2}" text-anchor="middle">${escHtml(nameSecond)}</text>
    <text x="325" y="117" font-family="Inter,Segoe UI,sans-serif" font-size="12" fill="#64748b" text-anchor="middle">${onlySecond.length}</text>

    <text x="220" y="99" font-family="Inter,Segoe UI,sans-serif" font-size="11" font-weight="600" fill="#f1f5f9" text-anchor="middle">${nameFirst}∩${nameSecond}</text>
    <text x="220" y="115" font-family="Inter,Segoe UI,sans-serif" font-size="12" fill="#64748b" text-anchor="middle">${inter.length}</text>

    <text x="220" y="186" font-family="Inter,Segoe UI,sans-serif" font-size="11" fill="#64748b" text-anchor="middle">Hasil: ${members.length} anggota</text>
  </svg>`;
}

/**
 * Diagram Venn Complement.
 */
function renderVennComplement(opResult) {
  const { nameFirst, members } = opResult;
  const colorMap = { A:'#f97316', B:'#10b981', C:'#8b5cf6' };
  const c1 = colorMap[nameFirst] || '#f97316';
  const setFirst = getSetByCode(nameFirst);

  return `
  <svg viewBox="0 0 440 210" xmlns="http://www.w3.org/2000/svg" width="440" height="210" role="img" aria-label="Diagram Venn Komplemen">
    <rect x="8" y="8" width="424" height="194" rx="10" fill="#1a1d27" fill-opacity="1" stroke="rgba(255,255,255,.08)" stroke-width="1.5"/>
    <rect x="8" y="8" width="424" height="194" rx="10" fill="${c1}" fill-opacity=".06"/>
    <text x="22" y="30" font-family="Inter,Segoe UI,sans-serif" font-size="11" fill="#64748b" font-weight="700">U (${getUniverse().length})</text>

    <circle cx="220" cy="105" r="72" fill="${c1}" fill-opacity=".18" stroke="${c1}" stroke-width="2.5"/>
    <circle cx="220" cy="105" r="72" fill="#1a1d27" fill-opacity=".6"/>

    <text x="220" y="100" font-family="Inter,Segoe UI,sans-serif" font-size="16" font-weight="800" fill="${c1}" text-anchor="middle">${escHtml(nameFirst)}</text>
    <text x="220" y="118" font-family="Inter,Segoe UI,sans-serif" font-size="12" fill="#64748b" text-anchor="middle">${setFirst.length} anggota</text>

    <text x="55" y="140" font-family="Inter,Segoe UI,sans-serif" font-size="12" font-weight="700" fill="#f1f5f9" text-anchor="middle">${escHtml(nameFirst)}ᶜ</text>
    <text x="55" y="157" font-family="Inter,Segoe UI,sans-serif" font-size="12" fill="#64748b" text-anchor="middle">${members.length}</text>

    <text x="220" y="188" font-family="Inter,Segoe UI,sans-serif" font-size="11" fill="#64748b" text-anchor="middle">${escHtml(nameFirst)}ᶜ = U − ${escHtml(nameFirst)} = ${members.length} anggota</text>
  </svg>`;
}

/**
 * Diagram Venn 3 himpunan — SVG lengkap 7 region.
 * Setiap region menampilkan angka jumlah anggota.
 * @param {Array} setA, setB, setC
 * @param {Array} highlighted - array anggota yang di-highlight (hasil operasi)
 * @param {string} opType - jenis operasi untuk highlight
 */
function renderVennThreeSets(setA, setB, setC, highlighted = null, opType = null) {
  const r   = getVennRegions(setA, setB, setC);
  const uid = Date.now() + Math.floor(Math.random() * 1000);

  // Warna
  const cA = '#f97316', cB = '#10b981', cC = '#8b5cf6';

  // Jika ada highlighted, tentukan region mana yang aktif
  let hlSet = null;
  if (highlighted) {
    hlSet = new Set(highlighted.map(s => s.nim));
  }

  const regionActive = name => {
    if (!hlSet) return false;
    const regionArr = r[name];
    return regionArr.length > 0 && regionArr.some(s => hlSet.has(s.nim));
  };

  // Highlight warna per region
  const hlOnlyA = regionActive('onlyA');
  const hlOnlyB = regionActive('onlyB');
  const hlOnlyC = regionActive('onlyC');
  const hlAB    = regionActive('ab');
  const hlAC    = regionActive('ac');
  const hlBC    = regionActive('bc');
  const hlABC   = regionActive('abc');

  // Posisi lingkaran (overlap yang bagus untuk 3 set)
  // A: kiri-atas, B: kanan-atas, C: bawah-tengah
  const ax = 175, ay = 125, ar = 85;
  const bx = 265, by = 125, br = 85;
  const cx2 = 220, cy2 = 195, cr = 85;

  // Posisi label teks per region
  const posOnlyA = { x: 118, y: 108 };
  const posOnlyB = { x: 322, y: 108 };
  const posOnlyC = { x: 220, y: 272 };
  const posAB    = { x: 220, y: 108 };
  const posAC    = { x: 163, y: 195 };
  const posBC    = { x: 278, y: 195 };
  const posABC   = { x: 220, y: 163 };

  const baseOpac = '0.13';

  return `
  <svg viewBox="0 0 440 310" xmlns="http://www.w3.org/2000/svg" width="440" height="310"
       role="img" aria-label="Diagram Venn 3 himpunan">
    <!-- Universe -->
    <rect x="8" y="8" width="424" height="292" rx="12" fill="#1a1d27" stroke="rgba(255,255,255,.08)" stroke-width="1.5"/>
    <text x="22" y="28" font-family="Inter,Segoe UI,sans-serif" font-size="11" fill="#64748b" font-weight="700">U (${getUniverse().length})</text>

    <!-- Defs untuk clip paths -->
    <defs>
      <clipPath id="clipA${uid}"><circle cx="${ax}" cy="${ay}" r="${ar}"/></clipPath>
      <clipPath id="clipB${uid}"><circle cx="${bx}" cy="${by}" r="${br}"/></clipPath>
      <clipPath id="clipC${uid}"><circle cx="${cx2}" cy="${cy2}" r="${cr}"/></clipPath>

      <!-- onlyA = A tidak (B atau C) -->
      <clipPath id="clipOnlyA${uid}">
        <rect x="0" y="0" width="440" height="310"/>
      </clipPath>
    </defs>

    <!-- Base circles -->
    <circle cx="${ax}" cy="${ay}" r="${ar}" fill="${cA}" fill-opacity="${baseOpac}" stroke="${cA}" stroke-width="2"/>
    <circle cx="${bx}" cy="${by}" r="${br}" fill="${cB}" fill-opacity="${baseOpac}" stroke="${cB}" stroke-width="2"/>
    <circle cx="${cx2}" cy="${cy2}" r="${cr}" fill="${cC}" fill-opacity="${baseOpac}" stroke="${cC}" stroke-width="2"/>

    <!-- Highlight layer: hanya highlight region yang aktif dengan warna gelap -->
    <!-- Only A highlight -->
    ${hlOnlyA ? `
    <circle cx="${ax}" cy="${ay}" r="${ar}" fill="${cA}" fill-opacity="0.42" clip-path="url(#clipA${uid})"/>
    <circle cx="${bx}" cy="${by}" r="${br}" fill="#1a1d27" fill-opacity="0.80" clip-path="url(#clipA${uid})"/>
    <circle cx="${cx2}" cy="${cy2}" r="${cr}" fill="#1a1d27" fill-opacity="0.80" clip-path="url(#clipA${uid})"/>
    ` : ''}

    <!-- Only B highlight -->
    ${hlOnlyB ? `
    <circle cx="${bx}" cy="${by}" r="${br}" fill="${cB}" fill-opacity="0.42" clip-path="url(#clipB${uid})"/>
    <circle cx="${ax}" cy="${ay}" r="${ar}" fill="#1a1d27" fill-opacity="0.80" clip-path="url(#clipB${uid})"/>
    <circle cx="${cx2}" cy="${cy2}" r="${cr}" fill="#1a1d27" fill-opacity="0.80" clip-path="url(#clipB${uid})"/>
    ` : ''}

    <!-- Only C highlight -->
    ${hlOnlyC ? `
    <circle cx="${cx2}" cy="${cy2}" r="${cr}" fill="${cC}" fill-opacity="0.42" clip-path="url(#clipC${uid})"/>
    <circle cx="${ax}" cy="${ay}" r="${ar}" fill="#1a1d27" fill-opacity="0.80" clip-path="url(#clipC${uid})"/>
    <circle cx="${bx}" cy="${by}" r="${br}" fill="#1a1d27" fill-opacity="0.80" clip-path="url(#clipC${uid})"/>
    ` : ''}

    <!-- A∩B highlight (in A, clip by B, remove C) -->
    ${hlAB ? `
    <circle cx="${bx}" cy="${by}" r="${br}" fill="#f59e0b" fill-opacity="0.50" clip-path="url(#clipA${uid})"/>
    <circle cx="${cx2}" cy="${cy2}" r="${cr}" fill="#1a1d27" fill-opacity="0.80" clip-path="url(#clipA${uid})"/>
    ` : ''}

    <!-- A∩C highlight -->
    ${hlAC ? `
    <circle cx="${cx2}" cy="${cy2}" r="${cr}" fill="#c084fc" fill-opacity="0.45" clip-path="url(#clipA${uid})"/>
    <circle cx="${bx}" cy="${by}" r="${br}" fill="#1a1d27" fill-opacity="0.80" clip-path="url(#clipA${uid})"/>
    ` : ''}

    <!-- B∩C highlight -->
    ${hlBC ? `
    <circle cx="${cx2}" cy="${cy2}" r="${cr}" fill="#34d399" fill-opacity="0.50" clip-path="url(#clipB${uid})"/>
    <circle cx="${ax}" cy="${ay}" r="${ar}" fill="#1a1d27" fill-opacity="0.80" clip-path="url(#clipB${uid})"/>
    ` : ''}

    <!-- A∩B∩C highlight -->
    ${hlABC ? `
    <circle cx="${bx}" cy="${by}" r="${br}" fill="#6366f1" fill-opacity="0.60" clip-path="url(#clipA${uid})"/>
    ` : ''}

    <!-- Region Labels: nama himpunan -->
    <text x="${ax - 20}" y="${ay - ar - 8}" font-family="Inter,Segoe UI,sans-serif" font-size="14" font-weight="800" fill="${cA}">A</text>
    <text x="${bx + 10}" y="${by - br - 8}" font-family="Inter,Segoe UI,sans-serif" font-size="14" font-weight="800" fill="${cB}">B</text>
    <text x="${cx2 + cr - 10}" y="${cy2 + 16}" font-family="Inter,Segoe UI,sans-serif" font-size="14" font-weight="800" fill="${cC}">C</text>

    <!-- Region counts -->
    <text x="${posOnlyA.x}" y="${posOnlyA.y}" font-family="Inter,Segoe UI,sans-serif" font-size="13" font-weight="700" fill="${cA}" text-anchor="middle">${r.onlyA.length}</text>
    <text x="${posOnlyA.x}" y="${posOnlyA.y + 14}" font-family="Inter,Segoe UI,sans-serif" font-size="10" fill="#64748b" text-anchor="middle">hanya A</text>

    <text x="${posOnlyB.x}" y="${posOnlyB.y}" font-family="Inter,Segoe UI,sans-serif" font-size="13" font-weight="700" fill="${cB}" text-anchor="middle">${r.onlyB.length}</text>
    <text x="${posOnlyB.x}" y="${posOnlyB.y + 14}" font-family="Inter,Segoe UI,sans-serif" font-size="10" fill="#64748b" text-anchor="middle">hanya B</text>

    <text x="${posOnlyC.x}" y="${posOnlyC.y}" font-family="Inter,Segoe UI,sans-serif" font-size="13" font-weight="700" fill="${cC}" text-anchor="middle">${r.onlyC.length}</text>
    <text x="${posOnlyC.x}" y="${posOnlyC.y + 14}" font-family="Inter,Segoe UI,sans-serif" font-size="10" fill="#64748b" text-anchor="middle">hanya C</text>

    <text x="${posAB.x}" y="${posAB.y}" font-family="Inter,Segoe UI,sans-serif" font-size="12" font-weight="700" fill="#f1f5f9" text-anchor="middle">${r.ab.length}</text>
    <text x="${posAB.x}" y="${posAB.y + 13}" font-family="Inter,Segoe UI,sans-serif" font-size="9" fill="#64748b" text-anchor="middle">A∩B</text>

    <text x="${posAC.x}" y="${posAC.y}" font-family="Inter,Segoe UI,sans-serif" font-size="12" font-weight="700" fill="#f1f5f9" text-anchor="middle">${r.ac.length}</text>
    <text x="${posAC.x}" y="${posAC.y + 13}" font-family="Inter,Segoe UI,sans-serif" font-size="9" fill="#64748b" text-anchor="middle">A∩C</text>

    <text x="${posBC.x}" y="${posBC.y}" font-family="Inter,Segoe UI,sans-serif" font-size="12" font-weight="700" fill="#f1f5f9" text-anchor="middle">${r.bc.length}</text>
    <text x="${posBC.x}" y="${posBC.y + 13}" font-family="Inter,Segoe UI,sans-serif" font-size="9" fill="#64748b" text-anchor="middle">B∩C</text>

    <text x="${posABC.x}" y="${posABC.y}" font-family="Inter,Segoe UI,sans-serif" font-size="13" font-weight="800" fill="#f1f5f9" text-anchor="middle">${r.abc.length}</text>
    <text x="${posABC.x}" y="${posABC.y + 13}" font-family="Inter,Segoe UI,sans-serif" font-size="9" fill="#64748b" text-anchor="middle">A∩B∩C</text>
  </svg>`;
}

/* ================================================
   15. HALAMAN DIAGRAM VENN (penuh)
================================================ */

function renderFullVenn() {
  const A   = getSetA();
  const B   = getSetB();
  const C   = getSetC();
  const cfg = DS_CONFIG[activeDataset];

  // Update judul
  document.getElementById('vennFullTitle').textContent =
    `Diagram Venn — A ∪ B ∪ C (${cfg.name})`;
  document.getElementById('vennFullDataset').textContent = cfg.name;

  // Render SVG 3 set
  const container = document.getElementById('vennFullDiagram');
  container.innerHTML = renderVennThreeSets(A, B, C, null, null);

  // Render legend
  const legend = document.getElementById('vennLegend');
  legend.innerHTML = `
    <div class="venn-legend-item"><span class="vleg-dot" style="background:#f97316"></span>A — ${cfg.labelA} (${A.length})</div>
    <div class="venn-legend-item"><span class="vleg-dot" style="background:#10b981"></span>B — ${cfg.labelB} (${B.length})</div>
    <div class="venn-legend-item"><span class="vleg-dot" style="background:#8b5cf6"></span>C — ${cfg.labelC} (${C.length})</div>
  `;

  // Render region detail
  renderVennRegionDetail(A, B, C, cfg);

  // Render Venn 2 set default
  renderVenn2(
    document.getElementById('venn2SetFirst').value,
    document.getElementById('venn2SetSecond').value
  );
}

function renderVennRegionDetail(A, B, C, cfg) {
  const r = getVennRegions(A, B, C);

  const regions = [
    { key: 'onlyA', label: 'Hanya A',      color: '#f97316', desc: `${cfg.labelA} saja` },
    { key: 'onlyB', label: 'Hanya B',      color: '#10b981', desc: `${cfg.labelB} saja` },
    { key: 'onlyC', label: 'Hanya C',      color: '#8b5cf6', desc: `${cfg.labelC} saja` },
    { key: 'ab',    label: 'A ∩ B (−C)',   color: '#f59e0b', desc: 'Ada di A dan B, tidak di C' },
    { key: 'ac',    label: 'A ∩ C (−B)',   color: '#c084fc', desc: 'Ada di A dan C, tidak di B' },
    { key: 'bc',    label: 'B ∩ C (−A)',   color: '#34d399', desc: 'Ada di B dan C, tidak di A' },
    { key: 'abc',   label: 'A ∩ B ∩ C',   color: '#6366f1', desc: 'Ada di A, B, dan C' }
  ];

  const grid = document.getElementById('vennRegionsGrid');
  grid.innerHTML = regions.map(reg => {
    const members = r[reg.key];
    const names = members.slice(0, 5).map(s => escHtml(s.nama)).join(', ');
    const more  = members.length > 5 ? ` +${members.length - 5} lainnya` : '';
    return `
      <div class="venn-region-card">
        <div class="venn-region-header" style="border-left:3px solid ${reg.color}">
          <span class="venn-region-label" style="color:${reg.color}">${reg.label}</span>
          <span class="venn-region-count" style="color:${reg.color}">${members.length}</span>
        </div>
        <div class="venn-region-desc">${reg.desc}</div>
        <div class="venn-region-members">${members.length > 0 ? names + more : '<em>Kosong</em>'}</div>
      </div>`;
  }).join('');
}

function renderVenn2(nameFirst, nameSecond) {
  if (nameFirst === nameSecond) {
    document.getElementById('venn2Diagram').innerHTML =
      '<p class="empty-text" style="padding:16px">Pilih dua himpunan yang berbeda.</p>';
    return;
  }

  const fake = {
    opType: 'union',
    nameFirst,
    nameSecond,
    members: union(getSetByCode(nameFirst), getSetByCode(nameSecond))
  };
  document.getElementById('venn2Diagram').innerHTML = renderVennTwoSets(fake);
}

/* ================================================
   16. HALAMAN PIE (INKLUSI-EKSKLUSI)
================================================ */

function renderPIE2() {
  const nameX = document.getElementById('pie2SetA').value;
  const nameY = document.getElementById('pie2SetB').value;

  if (nameX === nameY) {
    showToast('Pilih dua himpunan yang berbeda untuk PIE 2.', 'error');
    return;
  }

  const cfg  = DS_CONFIG[activeDataset];
  const setX = getSetByCode(nameX);
  const setY = getSetByCode(nameY);

  if (setX.length === 0 && setY.length === 0) {
    document.getElementById('pie2Result').innerHTML =
      '<p class="empty-text">Kedua himpunan kosong.</p>';
    return;
  }

  const labelMap = { A: cfg.labelA, B: cfg.labelB, C: cfg.labelC };
  const pie = calculatePIE2(setX, setY);

  const el = document.getElementById('pie2Result');
  el.innerHTML = `
    <div class="pie-calc-box">
      <div class="pie-calc-title">Perhitungan PIE — ${nameX} ∪ ${nameY}</div>

      <div class="pie-step-list">
        <div class="pie-step">|${nameX}| = ${pie.sizeX} <span class="pie-step-desc">(${labelMap[nameX]})</span></div>
        <div class="pie-step">|${nameY}| = ${pie.sizeY} <span class="pie-step-desc">(${labelMap[nameY]})</span></div>
        <div class="pie-step pie-step--sub">|${nameX} ∩ ${nameY}| = ${pie.sizeXY} <span class="pie-step-desc">(Irisan)</span></div>
      </div>

      <div class="pie-formula-line">
        |${nameX} ∪ ${nameY}| = |${nameX}| + |${nameY}| − |${nameX} ∩ ${nameY}|
      </div>
      <div class="pie-formula-line">
        = ${pie.sizeX} + ${pie.sizeY} − ${pie.sizeXY}
      </div>
      <div class="pie-formula-line pie-formula-result">
        = <strong>${pie.piResult}</strong>
      </div>

      <div class="pie-validation ${pie.valid ? 'valid' : 'invalid'}">
        <div class="pie-val-row">
          <span>Hasil PIE:</span><strong>${pie.piResult}</strong>
        </div>
        <div class="pie-val-row">
          <span>Direct Union |${nameX} ∪ ${nameY}|:</span><strong>${pie.directCount}</strong>
        </div>
        <div class="pie-val-status">
          ${pie.valid
            ? '✓ Hasil PIE valid — sama dengan Direct Union'
            : '⚠ Ketidaksesuaian terdeteksi — periksa data'}
        </div>
      </div>

      <div class="pie-members-preview">
        <strong>Anggota irisan ${nameX} ∩ ${nameY} (${pie.inter.length}):</strong>
        <span>${pie.inter.length > 0
          ? pie.inter.slice(0, 8).map(s => escHtml(s.nama)).join(', ') + (pie.inter.length > 8 ? ` +${pie.inter.length - 8} lainnya` : '')
          : 'Kosong'}</span>
      </div>
    </div>`;
}

function renderPIE3() {
  const A   = getSetA();
  const B   = getSetB();
  const C   = getSetC();
  const cfg = DS_CONFIG[activeDataset];
  const pie = calculatePIE3(A, B, C);

  const el = document.getElementById('pie3Result');
  el.innerHTML = `
    <div class="pie-calc-box mt-1">
      <div class="pie-calc-title">Perhitungan PIE — A ∪ B ∪ C (${cfg.name})</div>

      <div class="pie-step-list">
        <div class="pie-step">|A| = ${pie.sA} <span class="pie-step-desc">(${cfg.labelA})</span></div>
        <div class="pie-step">|B| = ${pie.sB} <span class="pie-step-desc">(${cfg.labelB})</span></div>
        <div class="pie-step">|C| = ${pie.sC} <span class="pie-step-desc">(${cfg.labelC})</span></div>
        <div class="pie-step pie-step--sub">|A ∩ B| = ${pie.sAB}</div>
        <div class="pie-step pie-step--sub">|A ∩ C| = ${pie.sAC}</div>
        <div class="pie-step pie-step--sub">|B ∩ C| = ${pie.sBC}</div>
        <div class="pie-step pie-step--add">|A ∩ B ∩ C| = ${pie.sABC}</div>
      </div>

      <div class="pie-formula-line">
        |A ∪ B ∪ C| = |A| + |B| + |C| − |A ∩ B| − |A ∩ C| − |B ∩ C| + |A ∩ B ∩ C|
      </div>
      <div class="pie-formula-line">
        = ${pie.sA} + ${pie.sB} + ${pie.sC} − ${pie.sAB} − ${pie.sAC} − ${pie.sBC} + ${pie.sABC}
      </div>
      <div class="pie-formula-line">
        = ${pie.sA + pie.sB + pie.sC} − ${pie.sAB + pie.sAC + pie.sBC} + ${pie.sABC}
      </div>
      <div class="pie-formula-line pie-formula-result">
        = <strong>${pie.piResult}</strong>
      </div>

      <div class="pie-validation ${pie.valid ? 'valid' : 'invalid'}">
        <div class="pie-val-row">
          <span>Hasil PIE (|A ∪ B ∪ C|):</span><strong>${pie.piResult}</strong>
        </div>
        <div class="pie-val-row">
          <span>Direct Union A ∪ B ∪ C:</span><strong>${pie.directCount}</strong>
        </div>
        <div class="pie-val-status">
          ${pie.valid
            ? '✓ Hasil PIE valid — sama dengan Direct Union'
            : '⚠ Ketidaksesuaian terdeteksi — periksa data'}
        </div>
      </div>

      <div class="pie-members-preview">
        <strong>Anggota A ∩ B ∩ C (${pie.interABC.length}):</strong>
        <span>${pie.interABC.length > 0
          ? pie.interABC.slice(0, 8).map(s => escHtml(s.nama)).join(', ') + (pie.interABC.length > 8 ? ` +${pie.interABC.length - 8} lainnya` : '')
          : 'Kosong'}</span>
      </div>

      <div class="pie-intersections-detail">
        <div class="pie-isect-item"><span>A ∩ B (${pie.interAB.length}):</span>
          <span>${pie.interAB.slice(0,5).map(s=>escHtml(s.nama)).join(', ')||'—'}${pie.interAB.length>5?` +${pie.interAB.length-5}`:''}
          </span>
        </div>
        <div class="pie-isect-item"><span>A ∩ C (${pie.interAC.length}):</span>
          <span>${pie.interAC.slice(0,5).map(s=>escHtml(s.nama)).join(', ')||'—'}${pie.interAC.length>5?` +${pie.interAC.length-5}`:''}
          </span>
        </div>
        <div class="pie-isect-item"><span>B ∩ C (${pie.interBC.length}):</span>
          <span>${pie.interBC.slice(0,5).map(s=>escHtml(s.nama)).join(', ')||'—'}${pie.interBC.length>5?` +${pie.interBC.length-5}`:''}
          </span>
        </div>
      </div>
    </div>`;

  // Tampilkan validasi card
  renderPIEValidation(pie);
}

function renderPIEValidation(pie) {
  const card = document.getElementById('pieValidationCard');
  const el   = document.getElementById('pieValidationContent');
  card.style.display = '';

  el.innerHTML = `
    <div class="pie-validation-full ${pie.valid ? 'valid' : 'invalid'}">
      <div class="pie-val-main">
        <div class="pie-val-big ${pie.valid ? 'valid' : 'invalid'}">
          ${pie.valid ? '✓' : '⚠'}
        </div>
        <div class="pie-val-text">
          <strong>${pie.valid ? 'Perhitungan PIE Valid' : 'Terdapat Ketidaksesuaian'}</strong>
          <p>|A ∪ B ∪ C| via PIE = <strong>${pie.piResult}</strong> &nbsp;|&nbsp; Direct Union = <strong>${pie.directCount}</strong></p>
          ${pie.valid
            ? '<p class="pie-val-ok">Prinsip Inklusi-Eksklusi terbukti benar pada dataset ini.</p>'
            : '<p class="pie-val-warn">Periksa apakah terdapat duplikasi NIM atau data tidak valid.</p>'}
        </div>
      </div>
    </div>`;
}

function clearPieResults() {
  document.getElementById('pie2Result').innerHTML = '';
  document.getElementById('pie3Result').innerHTML = '';
  document.getElementById('pieValidationCard').style.display = 'none';
}

/* ================================================
   17. CRUD DATASET
================================================ */

function openAddModal() {
  clearForm();
  document.getElementById('modalTitle').textContent   = 'Tambah Data';
  document.getElementById('editNimOriginal').value    = '';
  document.getElementById('btnModalSave').textContent = 'Simpan';
  updateModalFields();
  openModal();
}

function openEditModal(nim) {
  const data    = getUniverse();
  const student = data.find(s => s.nim === nim);
  if (!student) return;

  clearForm();
  document.getElementById('modalTitle').textContent   = 'Edit Data';
  document.getElementById('editNimOriginal').value    = nim;
  document.getElementById('fNim').value               = student.nim;
  document.getElementById('fNama').value              = student.nama;
  document.getElementById('fNilai').value             = student.nilai;
  document.getElementById('fKehadiran').value         = student.kehadiran;
  document.querySelector(`input[name="fOrganisasi"][value="${student.organisasi}"]`).checked = true;

  // Dataset 2 fields
  if (activeDataset === 2) {
    if (student.seminar)   document.querySelector(`input[name="fSeminar"][value="${student.seminar}"]`).checked = true;
    if (student.workshop)  document.querySelector(`input[name="fWorkshop"][value="${student.workshop}"]`).checked = true;
    if (student.kompetisi) document.querySelector(`input[name="fKompetisi"][value="${student.kompetisi}"]`).checked = true;
  }

  document.getElementById('btnModalSave').textContent = 'Perbarui';
  updateModalFields();
  openModal();
}

/** Tampilkan / sembunyikan field sesuai dataset aktif */
function updateModalFields() {
  const isDs2 = activeDataset === 2;
  document.getElementById('formGroupSeminar').classList.toggle('hidden', !isDs2);
  document.getElementById('formGroupWorkshop').classList.toggle('hidden', !isDs2);
  document.getElementById('formGroupKompetisi').classList.toggle('hidden', !isDs2);
}

function deleteStudent(nim) {
  if (!confirm(`Hapus data dengan ID "${nim}"?`)) return;
  let data = getUniverse();
  data = data.filter(s => s.nim !== nim);
  saveData(data);
  refreshAll();
  showToast('Data berhasil dihapus.', 'success');
}

function resetDataset() {
  if (!confirm('Reset dataset ke data default? Semua perubahan akan hilang.')) return;
  saveData(DS_CONFIG[activeDataset].data);
  localStorage.removeItem(LAST_OP_KEY);
  lastOpResult = null;
  clearResultDisplay();
  refreshAll();
  showToast('Dataset direset ke data default.', 'info');
}

/** Load dataset 1 */
function loadDataset1() {
  if (!confirm('Ganti ke Dataset 1? Data yang diubah akan kembali ke default.')) return;
  switchDataset(1);
}

/** Load dataset 2 */
function loadDataset2() {
  if (!confirm('Ganti ke Dataset 2? Data yang diubah akan kembali ke default.')) return;
  switchDataset(2);
}

function handleFormSubmit(e) {
  e.preventDefault();
  if (!validateForm()) return;

  const nim        = document.getElementById('fNim').value.trim();
  const nama       = document.getElementById('fNama').value.trim();
  const nilai      = parseInt(document.getElementById('fNilai').value, 10);
  const kehadiran  = parseInt(document.getElementById('fKehadiran').value, 10);
  const organisasi = document.querySelector('input[name="fOrganisasi"]:checked').value;
  const nimOri     = document.getElementById('editNimOriginal').value;

  let newEntry = { nim, nama, nilai, kehadiran, organisasi };

  // Dataset 2: tambah field kegiatan
  if (activeDataset === 2) {
    newEntry.seminar   = document.querySelector('input[name="fSeminar"]:checked')?.value   || 'Tidak';
    newEntry.workshop  = document.querySelector('input[name="fWorkshop"]:checked')?.value  || 'Tidak';
    newEntry.kompetisi = document.querySelector('input[name="fKompetisi"]:checked')?.value || 'Tidak';
  }

  let data = getUniverse();

  if (nimOri) {
    const idx = data.findIndex(s => s.nim === nimOri);
    if (idx !== -1) data[idx] = newEntry;
    saveData(data);
    closeModal();
    refreshAll();
    showToast('Data berhasil diperbarui.', 'success');
  } else {
    if (data.some(s => s.nim === nim)) {
      setFieldError('errNim', 'ID/NIM sudah terdaftar.');
      return;
    }
    data.push(newEntry);
    saveData(data);
    closeModal();
    refreshAll();
    showToast('Data berhasil ditambahkan.', 'success');
  }
}

function validateForm() {
  let valid = true;
  clearFormErrors();

  const nim      = document.getElementById('fNim').value.trim();
  const nama     = document.getElementById('fNama').value.trim();
  const nilaiRaw = document.getElementById('fNilai').value;
  const hadirRaw = document.getElementById('fKehadiran').value;

  if (!nim)  { setFieldError('errNim', 'ID tidak boleh kosong.'); valid = false; }
  if (!nama) { setFieldError('errNama', 'Nama tidak boleh kosong.'); valid = false; }
  if (nilaiRaw === '' || isNaN(nilaiRaw)) {
    setFieldError('errNilai', 'Masukkan nilai.'); valid = false;
  } else {
    const n = parseInt(nilaiRaw, 10);
    if (n < 0 || n > 100) { setFieldError('errNilai', 'Nilai harus 0–100.'); valid = false; }
  }
  if (hadirRaw === '' || isNaN(hadirRaw)) {
    setFieldError('errKehadiran', 'Masukkan kehadiran.'); valid = false;
  } else {
    const h = parseInt(hadirRaw, 10);
    if (h < 0 || h > 100) { setFieldError('errKehadiran', 'Kehadiran harus 0–100.'); valid = false; }
  }
  return valid;
}

function setFieldError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
  const inputMap = { errNim:'fNim', errNama:'fNama', errNilai:'fNilai', errKehadiran:'fKehadiran' };
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
  document.querySelector('input[name="fOrganisasi"][value="Tidak"]').checked = true;
}

/* ================================================
   18. EXPORT CSV
================================================ */

function exportCSV(dataArr, filename) {
  if (!dataArr || dataArr.length === 0) {
    showToast('Tidak ada data untuk diekspor.', 'error');
    return;
  }
  const header = ['NIM/ID', 'Nama', 'Nilai', 'Organisasi', 'Kehadiran (%)'];
  const rows   = dataArr.map(s =>
    [s.nim, s.nama, s.nilai, s.organisasi, s.kehadiran]
      .map(v => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  );
  const csvContent = [header.join(','), ...rows].join('\r\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename || 'export.csv';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`CSV "${filename}" berhasil diekspor.`, 'success');
}

/* ================================================
   19. COPY HASIL
================================================ */

function copyResult() {
  if (!lastOpResult || lastOpResult.members.length === 0) {
    showToast('Tidak ada data untuk disalin.', 'error');
    return;
  }
  const lines = [`${lastOpResult.formula} — ${lastOpResult.members.length} anggota`, ''];
  lastOpResult.members.forEach((s, i) => {
    lines.push(`${i + 1}. ${s.nim} — ${s.nama} — Nilai: ${s.nilai} — Org: ${s.organisasi} — Hadir: ${s.kehadiran}%`);
  });
  navigator.clipboard.writeText(lines.join('\n'))
    .then(() => showToast('Hasil disalin ke clipboard.', 'success'))
    .catch(() => showToast('Gagal menyalin. Coba manual.', 'error'));
}

/* ================================================
   20. CLEAR HASIL
================================================ */

function clearResultDisplay() {
  lastOpResult = null;
  document.getElementById('resultPlaceholder').style.display = '';
  const rc = document.getElementById('resultContent');
  rc.classList.add('hidden');
  rc.style.display = '';
}

/* ================================================
   21. MODAL HELPERS
================================================ */

function openModal() {
  document.getElementById('modalOverlay').classList.add('active');
  setTimeout(() => document.getElementById('fNim').focus(), 100);
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

/* ================================================
   22. TOAST NOTIFICATION
================================================ */

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
  }, 3200);
}

/* ================================================
   23. NAVIGASI
================================================ */

function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item, .bottom-nav-item').forEach(n => n.classList.remove('active'));

  const el = document.getElementById(`page-${page}`);
  if (el) el.classList.add('active');

  document.querySelectorAll(`[data-page="${page}"]`).forEach(n => n.classList.add('active'));

  const titles = {
    dashboard: 'Dashboard',
    dataset:   'Dataset',
    himpunan:  'Himpunan',
    operasi:   'Operasi Himpunan',
    venn:      'Diagram Venn',
    pie:       'Inklusi-Eksklusi',
    tentang:   'Tentang'
  };
  document.getElementById('pageTitle').textContent = titles[page] || page;

  currentPage = page;

  if (page === 'dashboard') updateDashboard();
  if (page === 'dataset')   renderDataset();
  if (page === 'himpunan')  renderSets();
  if (page === 'venn')      renderFullVenn();

  closeSidebar();
}

/* ================================================
   24. SIDEBAR MOBILE
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
   25. REFRESH SEMUA KOMPONEN
================================================ */

function refreshAll() {
  updateDashboard();
  if (currentPage === 'dataset')   renderDataset();
  if (currentPage === 'himpunan')  renderSets();
  if (currentPage === 'venn')      renderFullVenn();
  if (lastOpResult && currentPage === 'operasi') renderResult();
}

/* ================================================
   26. UTILITAS
================================================ */

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ================================================
   27. INISIALISASI & EVENT LISTENERS
================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* --- Inisialisasi dataset --- */
  const savedDs = localStorage.getItem(STORAGE_DS);
  if (savedDs === '2') activeDataset = 2;

  // Pastikan version check & data tersedia
  loadData();

  // Update labels sesuai dataset aktif
  updateSetSummaryLabels();

  // Update tombol switcher
  document.querySelectorAll('.ds-btn').forEach(b => {
    b.classList.toggle('active', Number(b.dataset.ds) === activeDataset);
  });

  /* --- Navigasi sidebar & bottom nav --- */
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(el.dataset.page);
    });
  });

  /* --- Dataset switcher (topbar) --- */
  document.querySelectorAll('.ds-btn').forEach(btn => {
    btn.addEventListener('click', () => switchDataset(Number(btn.dataset.ds)));
  });

  /* --- Hamburger & overlay --- */
  document.getElementById('hamburger').addEventListener('click', openSidebar);
  document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
  document.getElementById('overlay').addEventListener('click', closeSidebar);

  /* --- Tombol tambah data --- */
  document.getElementById('btnAddData').addEventListener('click', openAddModal);

  /* --- Tombol load dataset --- */
  document.getElementById('btnLoadDs1').addEventListener('click', loadDataset1);
  document.getElementById('btnLoadDs2').addEventListener('click', loadDataset2);

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

  /* --- Operasi: ubah jenis operasi → toggle input & tooltip --- */
  document.getElementById('opSelect').addEventListener('change', e => {
    const val          = e.target.value;
    const isComplement = val === 'complement';
    const isThree      = val === 'union3' || val === 'intersection3';

    document.getElementById('opInputsTwoSet').classList.toggle('hidden', isComplement || isThree);
    document.getElementById('opInputsThreeSet').classList.toggle('hidden', !isThree);
    document.getElementById('opInputsOneSet').classList.toggle('hidden', !isComplement);

    document.getElementById('opSymbolDisplay').textContent = OP_SYMBOLS[val] || '∪';

    // Update tooltip
    const tipEl = document.getElementById('opTooltip');
    tipEl.textContent = OP_TOOLTIPS[val] || '';
    tipEl.style.display = OP_TOOLTIPS[val] ? '' : 'none';
  });

  // Set tooltip default
  const tipEl = document.getElementById('opTooltip');
  tipEl.textContent = OP_TOOLTIPS['union'];

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

  /* --- Venn 2 set di halaman Venn --- */
  document.getElementById('btnRenderVenn2').addEventListener('click', () => {
    const a = document.getElementById('venn2SetFirst').value;
    const b = document.getElementById('venn2SetSecond').value;
    renderVenn2(a, b);
  });

  /* --- PIE 2 himpunan --- */
  document.getElementById('btnCalcPie2').addEventListener('click', renderPIE2);

  /* --- PIE 3 himpunan --- */
  document.getElementById('btnCalcPie3').addEventListener('click', renderPIE3);

  /* --- Escape menutup modal --- */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  /* ---- RENDER AWAL ---- */
  navigateTo('dashboard');
});
