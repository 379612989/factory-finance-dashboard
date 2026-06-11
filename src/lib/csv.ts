type CsvHeader<T> = {
  label: string;
  value: keyof T | ((row: T) => string | number);
};

function escapeCsv(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

export function toCsv<T>(rows: T[], headers: CsvHeader<T>[]) {
  const head = headers.map((item) => escapeCsv(item.label)).join(",");
  const body = rows
    .map((row) =>
      headers
        .map((header) => {
          const value =
            typeof header.value === "function" ? header.value(row) : row[header.value];
          return escapeCsv(value as string | number | null | undefined);
        })
        .join(","),
    )
    .join("\n");

  return `\uFEFF${head}\n${body}`;
}

export function downloadCsv<T>(filename: string, rows: T[], headers: CsvHeader<T>[]) {
  const blob = new Blob([toCsv(rows, headers)], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
