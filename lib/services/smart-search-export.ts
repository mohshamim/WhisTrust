import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface SearchResult {
  case_number: string;
  title: string;
  description?: string;
  category: string;
  status: string;
  priority?: string;
  created_at: string;
  risk_prediction?: any;
}

/**
 * Export search results to PDF
 */
export function exportToPDF(results: SearchResult[], searchQuery: string) {
  try {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Smart Search Results", 14, 20);
    
    // Add search query
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Search Query: "${searchQuery}"`, 14, 28);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34);
    doc.text(`Total Results: ${results.length}`, 14, 40);
    
    // Prepare table data
    const tableData = results.map((item) => [
      item.case_number,
      item.title,
      item.category,
      item.status,
      item.priority || "-",
      new Date(item.created_at).toLocaleDateString(),
    ]);
    
    // Add table
    autoTable(doc, {
      head: [["Case #", "Title", "Category", "Status", "Priority", "Date"]],
      body: tableData,
      startY: 45,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 60 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
      },
    });
    
    // Save PDF
    const filename = `search-results-${Date.now()}.pdf`;
    doc.save(filename);
    
    return { success: true, filename };
  } catch (error) {
    console.error("PDF export error:", error);
    return { success: false, error: "Failed to export PDF" };
  }
}

/**
 * Export search results to Excel
 */
export function exportToExcel(results: SearchResult[], searchQuery: string) {
  try {
    // Prepare data for Excel
    const excelData = results.map((item) => ({
      "Case Number": item.case_number,
      "Title": item.title,
      "Description": item.description || "",
      "Category": item.category,
      "Status": item.status,
      "Priority": item.priority || "-",
      "Risk Level": item.risk_prediction?.[0]?.risk_level || "-",
      "Date Created": new Date(item.created_at).toLocaleDateString(),
    }));
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    ws["!cols"] = [
      { wch: 15 }, // Case Number
      { wch: 40 }, // Title
      { wch: 50 }, // Description
      { wch: 20 }, // Category
      { wch: 15 }, // Status
      { wch: 15 }, // Priority
      { wch: 15 }, // Risk Level
      { wch: 15 }, // Date Created
    ];
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Search Results");
    
    // Add metadata sheet
    const metaData = [
      ["Search Query", searchQuery],
      ["Generated", new Date().toLocaleString()],
      ["Total Results", results.length],
    ];
    const metaWs = XLSX.utils.aoa_to_sheet(metaData);
    XLSX.utils.book_append_sheet(wb, metaWs, "Metadata");
    
    // Save Excel file
    const filename = `search-results-${Date.now()}.xlsx`;
    XLSX.writeFile(wb, filename);
    
    return { success: true, filename };
  } catch (error) {
    console.error("Excel export error:", error);
    return { success: false, error: "Failed to export Excel" };
  }
}

/**
 * Copy search results to clipboard as TSV
 */
export function copyToClipboard(results: SearchResult[]) {
  try {
    const headers = ["Case #", "Title", "Category", "Status", "Date"];
    const rows = results.map((item) => [
      item.case_number,
      item.title,
      item.category,
      item.status,
      new Date(item.created_at).toLocaleDateString(),
    ]);
    
    const tsv = [
      headers.join("\t"),
      ...rows.map((row) => row.join("\t")),
    ].join("\n");
    
    navigator.clipboard.writeText(tsv);
    return { success: true };
  } catch (error) {
    console.error("Clipboard copy error:", error);
    return { success: false, error: "Failed to copy to clipboard" };
  }
}

