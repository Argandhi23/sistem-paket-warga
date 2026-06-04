const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Error: DIRECT_URL or DATABASE_URL is not defined in .env');
  process.exit(1);
}

async function main() {
  // Use ssl if connecting to Supabase
  const client = new Client({
    connectionString,
    ssl: connectionString.includes('supabase.com') ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('Connected to the database successfully.');

    // Fetch all user tables in public schema
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE '_prisma_migrations';
    `);

    const tables = tablesRes.rows.map(r => r.table_name);
    console.log('Found tables:', tables);

    // Dependency ordering to avoid foreign key violations if loaded sequentially
    const preferredOrder = ['Rumah', 'User', 'Account', 'Session', 'Package', 'ActivityLog'];
    
    // Sort tables so preferred ones are first in that order, then any others
    tables.sort((a, b) => {
      const idxA = preferredOrder.findIndex(t => t.toLowerCase() === a.toLowerCase());
      const idxB = preferredOrder.findIndex(t => t.toLowerCase() === b.toLowerCase());
      
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    console.log('Exporting tables in order:', tables);

    const backupData = {};
    let sqlOutput = `-- Supabase Database Data Export\n`;
    sqlOutput += `-- Generated on: ${new Date().toISOString()}\n\n`;
    sqlOutput += `BEGIN;\n\n`;
    sqlOutput += `-- Disable triggers to prevent foreign key violations during restore\n`;
    sqlOutput += `SET session_replication_role = 'replica';\n\n`;

    // Clean existing data in reverse order of dependency
    sqlOutput += `-- Clean existing data in reverse order of dependency\n`;
    for (let i = tables.length - 1; i >= 0; i--) {
      const table = tables[i];
      sqlOutput += `TRUNCATE TABLE "${table}" CASCADE;\n`;
    }
    sqlOutput += `\n`;

    for (const table of tables) {
      console.log(`Exporting table: ${table}...`);
      
      // Get column metadata
      const colsRes = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [table]);
      
      const columns = colsRes.rows;
      
      // Get all rows
      const rowsRes = await client.query(`SELECT * FROM "${table}"`);
      const rows = rowsRes.rows;
      console.log(`Table "${table}" has ${rows.length} rows.`);

      backupData[table] = rows;

      if (rows.length > 0) {
        sqlOutput += `-- Data for table: ${table} (${rows.length} rows)\n`;
        
        for (const row of rows) {
          const colNames = [];
          const colValues = [];

          for (const col of columns) {
            const colName = col.column_name;
            const val = row[colName];
            
            colNames.push(`"${colName}"`);
            
            if (val === null || val === undefined) {
              colValues.push('NULL');
            } else if (typeof val === 'boolean') {
              colValues.push(val ? 'true' : 'false');
            } else if (typeof val === 'number') {
              colValues.push(val.toString());
            } else if (val instanceof Date) {
              colValues.push(`'${val.toISOString()}'`);
            } else if (typeof val === 'object') {
              // Handle array or json objects
              colValues.push(`'${JSON.stringify(val).replace(/'/g, "''")}'`);
            } else {
              // String
              colValues.push(`'${val.toString().replace(/'/g, "''")}'`);
            }
          }

          sqlOutput += `INSERT INTO "${table}" (${colNames.join(', ')}) VALUES (${colValues.join(', ')});\n`;
        }
        sqlOutput += `\n`;
      }
    }

    sqlOutput += `-- Re-enable triggers\n`;
    sqlOutput += `SET session_replication_role = 'origin';\n\n`;
    sqlOutput += `COMMIT;\n`;

    // Ensure prisma/backup folder exists
    const backupDir = path.join(__dirname, 'backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    const sqlPath = path.join(backupDir, 'supabase_backup.sql');
    const jsonPath = path.join(backupDir, 'supabase_backup.json');

    fs.writeFileSync(sqlPath, sqlOutput, 'utf8');
    fs.writeFileSync(jsonPath, JSON.stringify(backupData, null, 2), 'utf8');

    console.log(`\nExport completed successfully!`);
    console.log(`SQL backup written to: ${sqlPath}`);
    console.log(`JSON backup written to: ${jsonPath}`);

  } catch (err) {
    console.error('Error during database export:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
