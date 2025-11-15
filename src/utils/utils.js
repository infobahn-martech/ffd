import useAlertReducer from '../store/AlertReducer';
import * as XLSX from 'xlsx';

export const getInitials = (fullName) => {
  const nameParts = fullName?.split(' ');
  if (nameParts && nameParts.length > 0) {
    const firstName = nameParts[0];
    const lastName = nameParts[1];
    const initials = (
      firstName.charAt(0) + (lastName ? lastName.charAt(0) : '')
    ).toUpperCase();
    return initials;
  }
};

export function downloadFile({ link, fileName }) {
  if (!link) {
    const { error } = useAlertReducer.getState();
    error('Invalid link provided for download.');
    return; // Exit function if link is invalid
  }
  const url = link;
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url); // Release the object URL
  document.body.removeChild(a); // Remove the anchor element
}

export function downloadSampleXLSX(headings, fileName) {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Create a new worksheet
  const worksheet = XLSX.utils.aoa_to_sheet([headings]);

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  }

  // Convert the workbook to a blob
  const blob = new Blob(
    [s2ab(XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' }))],
    { type: 'application/octet-stream' },
  );

  // Create a download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);

  // Append the link to the document body and trigger the download
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
