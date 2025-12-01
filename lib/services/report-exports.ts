import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export interface ReportExportRow {
  caseNumber: string;
  category: string;
  status: string;
  priority: string;
  assignee: string;
  createdAt: string;
}

function hexToRgb(hex: string): [number, number, number] {
  let normalized = hex.replace("#", "").trim();
  if (normalized.length === 3) {
    normalized = normalized
      .split("")
      .map((c) => c + c)
      .join("");
  }

  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return [38, 50, 56];
  }

  return [r, g, b];
}

export function exportReportsPDF(
  rows: ReportExportRow[],
  organizationName?: string | null,
  filtersLabel?: string | null,
  brandHex?: string | null
): void {
  if (!rows.length) return;

  const brandColor = brandHex
    ? hexToRgb(brandHex)
    : hexToRgb("#c45a3a"); // WhisTrust primary fallback

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 40;
  const marginTop = 40;

  // Banner
  doc.setFillColor(brandColor[0], brandColor[1], brandColor[2]);
  doc.rect(0, 0, pageWidth, 70, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("WhisTrust Case Report Export", marginLeft, marginTop - 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `Generated on ${new Date().toLocaleString()}`,
    marginLeft,
    marginTop + 10
  );

  if (organizationName) {
    doc.text(organizationName, marginLeft, marginTop + 24);
  }

  if (rows.length) {
    const countLabel = `${rows.length} case${
      rows.length === 1 ? "" : "s"
    } included`;
    const textWidth = doc.getTextWidth(countLabel);
    doc.text(
      countLabel,
      pageWidth - marginLeft - textWidth,
      marginTop + 10
    );
  }

  if (filtersLabel) {
    const label = `Filters: ${filtersLabel}`;
    const textWidth = doc.getTextWidth(label);
    doc.text(
      label,
      pageWidth - marginLeft - textWidth,
      marginTop + 24
    );
  }

  doc.setTextColor(0, 0, 0);

  const body = rows.map((r) => [
    r.caseNumber,
    r.category,
    r.status,
    r.priority,
    r.assignee,
    r.createdAt,
  ]);

  autoTable(doc, {
    startY: marginTop + 40,
    head: [["Case Number", "Category", "Status", "Priority", "Assignee", "Created"]],
    body,
    styles: {
      fontSize: 9,
      cellPadding: 4,
      textColor: [55, 65, 81],
      lineColor: [229, 231, 235],
      lineWidth: 0.25,
    },
    headStyles: {
      fillColor: brandColor,
      textColor: 255,
      halign: "left",
    },
    alternateRowStyles: { fillColor: [252, 248, 246] },
    margin: { left: marginLeft, right: marginLeft },
  });

  doc.save(`whistrust-reports-${new Date().toISOString().split("T")[0]}.pdf`);
}

/**
 * Export reports as an Excel file with sheet protection (password required to edit).
 * This is UI-level protection (not full file encryption) but blocks casual edits.
 */
export function exportReportsExcelProtected(
  rows: ReportExportRow[],
  options?: {
    organizationName?: string | null;
    password?: string;
  }
): void {
  if (!rows.length) return;

  const header = [
    "Case Number",
    "Category",
    "Status",
    "Priority",
    "Assignee",
    "Created",
  ];

  const data = rows.map((r) => [
    r.caseNumber,
    r.category,
    r.status,
    r.priority,
    r.assignee,
    r.createdAt,
  ]);

  const aoa = [header, ...data];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Protect sheet: require password to edit
  const password = options?.password || "WhisTrust!2025";
  (ws as any)["!protect"] = {
    password,
    selectLockedCells: true,
    formatCells: false,
    formatColumns: false,
    formatRows: false,
    insertColumns: false,
    insertRows: false,
    insertHyperlinks: false,
    deleteColumns: false,
    deleteRows: false,
    sort: false,
    autoFilter: false,
    pivotTables: false,
  };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reports");

  XLSX.writeFile(
    wb,
    `whistrust-reports-${new Date().toISOString().split("T")[0]}.xlsx`
  );
}


