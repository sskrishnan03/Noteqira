import jsPDF from 'jspdf';

export function exportPDF(title: string, content: string) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  const lines = doc.splitTextToSize(title, maxWidth);
  doc.text(lines, margin, y);
  y += lines.length * 24 + 12;

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 20;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  const paragraphs = content.split('\n');
  for (const p of paragraphs) {
    const trimmed = p.trim();
    if (!trimmed) { y += 10; continue; }

    if (trimmed.startsWith('# ')) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      const text = trimmed.slice(2);
      const wrapped = doc.splitTextToSize(text, maxWidth);
      if (y + wrapped.length * 22 > doc.internal.pageSize.getHeight() - margin) doc.addPage();
      doc.text(wrapped, margin, y);
      y += wrapped.length * 22 + 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
    } else if (trimmed.startsWith('## ')) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      const text = trimmed.slice(3);
      const wrapped = doc.splitTextToSize(text, maxWidth);
      if (y + wrapped.length * 18 > doc.internal.pageSize.getHeight() - margin) doc.addPage();
      doc.text(wrapped, margin, y);
      y += wrapped.length * 18 + 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
    } else if (trimmed.startsWith('- ')) {
      const text = '\u2022  ' + trimmed.slice(2);
      const wrapped = doc.splitTextToSize(text, maxWidth);
      if (y + wrapped.length * 16 > doc.internal.pageSize.getHeight() - margin) doc.addPage();
      doc.text(wrapped, margin + 12, y);
      y += wrapped.length * 16 + 4;
    } else {
      const wrapped = doc.splitTextToSize(trimmed, maxWidth);
      if (y + wrapped.length * 16 > doc.internal.pageSize.getHeight() - margin) doc.addPage();
      doc.text(wrapped, margin, y);
      y += wrapped.length * 16 + 6;
    }
  }

  const safeName = title.replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'note';
  doc.save(`${safeName}.pdf`);
}
