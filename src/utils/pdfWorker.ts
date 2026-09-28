import { PdfDocument, PdfPage } from '../types/pdfak';

/**
 * Parses raw text from an uploaded TXT or simple PDF string
 */
export async function extractTextFromFile(file: File): Promise<{ text: string; pages: PdfPage[] }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string || '';
      
      // Split into pseudo-pages based on double newlines or 1000 characters
      const lines = content.split('\n');
      const pages: PdfPage[] = [];
      let currentPageText = '';
      let pageNum = 1;

      for (const line of lines) {
        currentPageText += line + '\n';
        if (currentPageText.length > 1200) {
          pages.push({
            pageNumber: pageNum,
            text: currentPageText.trim(),
          });
          pageNum++;
          currentPageText = '';
        }
      }

      if (currentPageText.trim() || pages.length === 0) {
        pages.push({
          pageNumber: pageNum,
          text: currentPageText.trim() || 'Uploaded document preview content.',
        });
      }

      resolve({
        text: content,
        pages,
      });
    };
    reader.readAsText(file);
  });
}

/**
 * Convert file to Base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Trigger file download in browser
 */
export function downloadFile(filename: string, content: string, mimeType: string = 'text/plain') {
  const element = document.createElement('a');
  const file = new Blob([content], { type: mimeType });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Format bytes into human readable size
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
