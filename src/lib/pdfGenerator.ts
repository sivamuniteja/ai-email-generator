import jsPDF from "jspdf"

export function generatePDF(subject: string | null, emailBody: string) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const margin = 20
  const pageWidth = doc.internal.pageSize.getWidth()
  const maxLineWidth = pageWidth - margin * 2

  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  
  let yPosition = margin

  if (subject) {
    doc.text(`Subject: ${subject}`, margin, yPosition)
    yPosition += 10
  }

  doc.setFont("helvetica", "normal")
  doc.setFontSize(12)
  
  // Split text to fit width
  const lines = doc.splitTextToSize(emailBody, maxLineWidth)
  
  // Add lines one by one, checking for page breaks
  lines.forEach((line: string) => {
    if (yPosition > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage()
      yPosition = margin
    }
    doc.text(line, margin, yPosition)
    yPosition += 6 // Line height
  })

  doc.save("email.pdf")
}
