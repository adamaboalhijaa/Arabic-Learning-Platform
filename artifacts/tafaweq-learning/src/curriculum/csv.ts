/**
 * قارئ/كاتب CSV متوافق مع RFC 4180 مع دعم عملي للملفات العربية:
 * علامة BOM، أسطر CRLF، الحقول بين علامتي تنصيص، وعلامات تنصيص مزدوجة،
 * واكتشاف الفاصل (فاصلة، فاصلة منقوطة، أو Tab) تلقائيًا.
 */
export interface CsvTable {
  headers: string[];
  rows: string[][];
}

function detectDelimiter(firstLine: string): string {
  const candidates = [',', ';', '\t'];
  let best = ',';
  let bestCount = -1;
  for (const candidate of candidates) {
    let count = 0;
    let inQuotes = false;
    for (let index = 0; index < firstLine.length; index += 1) {
      const char = firstLine[index];
      if (char === '"') inQuotes = !inQuotes;
      else if (char === candidate && !inQuotes) count += 1;
    }
    if (count > bestCount) {
      best = candidate;
      bestCount = count;
    }
  }
  return best;
}

export function parseCsv(text: string): CsvTable {
  const clean = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const firstBreak = clean.indexOf('\n');
  const firstLine = firstBreak === -1 ? clean : clean.slice(0, firstBreak);
  const delimiter = detectDelimiter(firstLine);

  const records: string[][] = [];
  let field = '';
  let record: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < clean.length; index += 1) {
    const char = clean[index];
    if (inQuotes) {
      if (char === '"') {
        if (clean[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      record.push(field);
      field = '';
    } else if (char === '\n') {
      record.push(field);
      records.push(record);
      record = [];
      field = '';
    } else {
      field += char;
    }
  }
  record.push(field);
  records.push(record);

  const nonEmpty = records.filter((row) => row.some((cell) => cell.trim() !== ''));
  if (!nonEmpty.length) return { headers: [], rows: [] };

  const headers = nonEmpty[0].map((header) => header.trim());
  const rows = nonEmpty.slice(1).map((row) => {
    const padded = [...row];
    while (padded.length < headers.length) padded.push('');
    return padded.slice(0, headers.length).map((cell) => cell.trim());
  });
  return { headers, rows };
}

function escapeCell(value: string): string {
  const text = String(value ?? '');
  if (/[",;\t\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function toCsv(table: CsvTable): string {
  const lines = [table.headers.map(escapeCell).join(',')];
  for (const row of table.rows) lines.push(row.map(escapeCell).join(','));
  return `\uFEFF${lines.join('\r\n')}`;
}

/** يحوّل جدول CSV إلى صفوف كائنية بمفاتيح العناوين. */
export function toRecords(table: CsvTable): Array<Record<string, string>> {
  return table.rows.map((row) => {
    const record: Record<string, string> = {};
    table.headers.forEach((header, index) => {
      record[header] = row[index] ?? '';
    });
    return record;
  });
}
