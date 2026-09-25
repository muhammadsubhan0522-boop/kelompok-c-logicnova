/**
 * tokenizer.js
 * ------------
 * Mengubah string ekspresi logika menjadi array token.
 *
 * Token yang dikenali:
 *   - Variabel  : satu atau lebih huruf/angka/underscore yang bukan keyword
 *   - AND       : &&, &, AND
 *   - OR        : ||, |, OR
 *   - NOT       : !, ~, NOT
 *   - IMPLIES   : ->, IMPLIES
 *   - IFF       : <->, IFF
 *   - XOR       : ^, XOR
 *   - LPAREN    : (
 *   - RPAREN    : )
 */

const TokenType = Object.freeze({
  AND:     'AND',
  OR:      'OR',
  NOT:     'NOT',
  IMPLIES: 'IMPLIES',
  IFF:     'IFF',
  XOR:     'XOR',
  LPAREN:  'LPAREN',
  RPAREN:  'RPAREN',
  VAR:     'VAR',
});

/**
 * Mengubah input string menjadi array token.
 * @param {string} input
 * @returns {{ type: string, value: string }[]}
 * @throws {Error} jika ditemukan karakter yang tidak dikenali
 */
function tokenize(input) {
  // Normalisasi: ganti simbol alternatif agar mudah diparsing
  const normalized = input
    .replace(/<->/g, ' IFF ')
    .replace(/->/g,  ' IMPLIES ')
    .replace(/&&/g,  ' AND ')
    .replace(/\|\|/g,' OR ')
    .replace(/&/g,   ' AND ')
    .replace(/\|/g,  ' OR ')
    .replace(/!/g,   ' NOT ')
    .replace(/~/g,   ' NOT ')
    .replace(/\^/g,  ' XOR ');

  const tokens = [];
  let i = 0;

  while (i < normalized.length) {
    // Lewati whitespace
    if (/\s/.test(normalized[i])) {
      i++;
      continue;
    }

    // Tanda kurung
    if (normalized[i] === '(') { tokens.push({ type: TokenType.LPAREN, value: '(' }); i++; continue; }
    if (normalized[i] === ')') { tokens.push({ type: TokenType.RPAREN, value: ')' }); i++; continue; }

    // Identifikasi kata (variabel atau keyword)
    if (/[a-zA-Z_]\w*/.test(normalized[i])) {
      let word = '';
      while (i < normalized.length && /\w/.test(normalized[i])) {
        word += normalized[i];
        i++;
      }

      const upper = word.toUpperCase();
      if      (upper === 'AND')     tokens.push({ type: TokenType.AND,     value: 'AND'     });
      else if (upper === 'OR')      tokens.push({ type: TokenType.OR,      value: 'OR'      });
      else if (upper === 'NOT')     tokens.push({ type: TokenType.NOT,     value: 'NOT'     });
      else if (upper === 'IMPLIES') tokens.push({ type: TokenType.IMPLIES, value: 'IMPLIES' });
      else if (upper === 'IFF')     tokens.push({ type: TokenType.IFF,     value: 'IFF'     });
      else if (upper === 'XOR')     tokens.push({ type: TokenType.XOR,     value: 'XOR'     });
      else if (upper === 'TRUE')    tokens.push({ type: TokenType.VAR,     value: 'TRUE'    });
      else if (upper === 'FALSE')   tokens.push({ type: TokenType.VAR,     value: 'FALSE'   });
      else                          tokens.push({ type: TokenType.VAR,     value: word      });

      continue;
    }

    // Karakter tidak dikenali
    throw new Error(`Karakter tidak dikenali: '${normalized[i]}'`);
  }

  return tokens;
}

/**
 * Mengekstrak semua nama variabel unik dari array token,
 * dalam urutan kemunculan pertama kali.
 * Literal TRUE/FALSE dikecualikan.
 * @param {{ type: string, value: string }[]} tokens
 * @returns {string[]} daftar variabel terurut
 */
function extractVariables(tokens) {
  const seen  = new Set();
  const order = [];

  for (const token of tokens) {
    if (
      token.type  === TokenType.VAR  &&
      token.value !== 'TRUE'         &&
      token.value !== 'FALSE'        &&
      !seen.has(token.value)
    ) {
      seen.add(token.value);
      order.push(token.value);
    }
  }

  return order;
}
