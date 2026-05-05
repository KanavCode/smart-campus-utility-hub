/**
 * CSV Export Utilities
 * Functions for converting data to CSV format and downloading as a file
 */

export interface User {
  id: string;
  full_name?: string;
  name?: string;
  email: string;
  role: string;
  department?: string;
  cgpa?: number;
  semester?: number;
  is_active?: boolean;
  created_at?: string;
}

/**
 * Escape CSV field values
 * @param field - The field value to escape
 * @returns Escaped field value suitable for CSV
 */
const escapeCSVField = (field: any): string => {
  if (field === null || field === undefined) {
    return '';
  }

  const stringField = String(field);

  // If field contains comma, newline, or double quote, wrap in quotes and escape inner quotes
  if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }

  return stringField;
};

/**
 * Convert users array to CSV string
 * @param users - Array of user objects
 * @returns CSV formatted string
 */
export const convertUsersToCSV = (users: User[]): string => {
  if (users.length === 0) {
    return '';
  }

  // Define headers
  const headers = ['ID', 'Full Name', 'Email', 'Role', 'Department', 'CGPA', 'Semester', 'Active', 'Created At'];
  const headerRow = headers.join(',');

  // Convert users to data rows
  const dataRows = users.map((user) => {
    return [
      escapeCSVField(user.id),
      escapeCSVField(user.full_name || user.name || ''),
      escapeCSVField(user.email),
      escapeCSVField(user.role),
      escapeCSVField(user.department || ''),
      escapeCSVField(user.cgpa !== undefined && user.cgpa !== null ? user.cgpa : ''),
      escapeCSVField(user.semester !== undefined && user.semester !== null ? user.semester : ''),
      escapeCSVField(user.is_active !== undefined ? (user.is_active ? 'Yes' : 'No') : ''),
      escapeCSVField(user.created_at ? new Date(user.created_at).toLocaleString() : ''),
    ].join(',');
  });

  return [headerRow, ...dataRows].join('\n');
};

/**
 * Download CSV file with users data
 * @param users - Array of user objects
 * @param filename - Name of the file to download (default: users.csv)
 */
export const downloadUsersAsCSV = (users: User[], filename: string = 'users.csv'): void => {
  const csv = convertUsersToCSV(users);

  if (!csv) {
    console.warn('No data to export');
    return;
  }

  // Create a Blob from the CSV string
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

  // Create a temporary URL for the blob
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
};

/**
 * Generate filename with current timestamp
 * @returns Filename with timestamp (e.g., users_2025-05-05_14-30-45.csv)
 */
export const generateTimestampedFilename = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `users_${year}-${month}-${day}_${hours}-${minutes}-${seconds}.csv`;
};
