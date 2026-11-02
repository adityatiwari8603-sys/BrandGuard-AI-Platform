import jsPDF from "jspdf";

export function downloadComplianceReport(report, content) {
  if (!report) {
    alert("No compliance report available.");
    return;
  }

  const pdf = new jsPDF();

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  let y = 20;

  const addPageIfNeeded = (height = 15) => {
    if (y + height > pageHeight - 20) {
      pdf.addPage();
      y = 20;
    }
  };

  const addHeading = (text) => {
    addPageIfNeeded(18);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(85, 70, 190);
    pdf.text(text, margin, y);

    y += 9;
  };

  const addParagraph = (text, options = {}) => {
    const {
      fontSize = 10,
      color = [55, 60, 75],
      bold = false,
    } = options;

    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(fontSize);
    pdf.setTextColor(...color);

    const lines = pdf.splitTextToSize(
      String(text || "Not available"),
      contentWidth
    );

    for (const line of lines) {
      addPageIfNeeded(7);
      pdf.text(line, margin, y);
      y += 6;
    }

    y += 2;
  };

  // HEADER
  pdf.setFillColor(20, 24, 42);
  pdf.rect(0, 0, pageWidth, 43, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(21);
  pdf.text("BrandGuard AI", margin, 19);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text(
    "INTELLIGENT BRAND GOVERNANCE",
    margin,
    28
  );

  pdf.setFontSize(10);
  pdf.text("CONTENT COMPLIANCE REPORT", margin, 37);

  y = 56;

  // REPORT INFORMATION
  addHeading("Report Summary");

  addParagraph(
    `Compliance Status: ${report.compliance_status}`,
    { bold: true }
  );

  addParagraph(
    `Total Findings: ${report.total_issues}`
  );

  addParagraph(
    `Guideline Document: ${report.guideline_filename || "Not available"}`
  );

  addParagraph(
    `Guideline ID: ${report.guideline_id || "Not available"}`
  );

  addParagraph(
    `Generated: ${new Date().toLocaleString()}`
  );

  // SUBMITTED CONTENT
  y += 3;

  addHeading("Submitted Content");

  addParagraph(content || "No submitted content available.");

  // FINDINGS
  y += 3;

  addHeading("Detailed Findings");

  if (!report.findings || report.findings.length === 0) {
    addParagraph("No issues were detected by the current compliance checks.");
  } else {
    report.findings.forEach((finding, index) => {
      addPageIfNeeded(45);

      pdf.setDrawColor(215, 218, 230);
      pdf.line(margin, y, pageWidth - margin, y);

      y += 8;

      addParagraph(
        `${index + 1}. ${finding.issue}`,
        { bold: true, fontSize: 11 }
      );

      addParagraph(
        `Category: ${finding.category}`
      );

      addParagraph(
        `Severity: ${finding.severity}`
      );

      addParagraph(
        `Detected Evidence: ${finding.evidence}`
      );

      addParagraph(
        `Guideline Reference: ${finding.guideline_reference}`
      );

      addParagraph(
        `Recommended Correction: ${finding.recommendation}`
      );

      y += 5;
    });
  }

  // HUMAN REVIEW NOTICE
  y += 5;

  addHeading("Human Review Notice");

  addParagraph(
    "Human review required: Yes."
  );

  addParagraph(
    "This report contains automated rule-based compliance findings. " +
    "It is intended to support decision-making and does not constitute " +
    "final publication approval. An authorised human reviewer should " +
    "verify all findings before publishing the submitted content."
  );

  // FOOTER ON EVERY PAGE
  const totalPages = pdf.internal.getNumberOfPages();

  for (let page = 1; page <= totalPages; page++) {
    pdf.setPage(page);

    pdf.setDrawColor(220, 223, 232);
    pdf.line(
      margin,
      pageHeight - 14,
      pageWidth - margin,
      pageHeight - 14
    );

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(120, 125, 140);

    pdf.text(
      "BrandGuard AI | Confidential Compliance Report",
      margin,
      pageHeight - 8
    );

    pdf.text(
      `Page ${page} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 8,
      { align: "right" }
    );
  }

  pdf.save("BrandGuard_AI_Compliance_Report.pdf");
}