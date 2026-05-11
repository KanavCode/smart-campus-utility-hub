const { query } = require('../../config/db');

const DEFAULT_SETTINGS = {
  academic_year: '2024-2025',
  current_semester: 'Fall',
  campus_name: 'Smart Campus University'
};

const getSettings = async () => {
  const result = await query(
    `
      SELECT academic_year, current_semester, campus_name
      FROM system_settings
      WHERE id = 1
    `
  );

  if (result.rows.length === 0) {
    return DEFAULT_SETTINGS;
  }

  return result.rows[0];
};

const upsertSettings = async ({ academic_year, current_semester, campus_name, updated_by }) => {
  const result = await query(
    `
      INSERT INTO system_settings (id, academic_year, current_semester, campus_name, updated_by)
      VALUES (1, $1, $2, $3, $4)
      ON CONFLICT (id)
      DO UPDATE SET
        academic_year = EXCLUDED.academic_year,
        current_semester = EXCLUDED.current_semester,
        campus_name = EXCLUDED.campus_name,
        updated_by = EXCLUDED.updated_by,
        updated_at = CURRENT_TIMESTAMP
      RETURNING academic_year, current_semester, campus_name
    `,
    [academic_year, current_semester, campus_name, updated_by]
  );

  return result.rows[0];
};

module.exports = {
  getSettings,
  upsertSettings,
  DEFAULT_SETTINGS
};
