import { db } from '../db';
import { readFileSync } from 'fs';
import { join } from 'path';

async function dropTables() {
  try {
    console.log('Dropping all tables...');
    // First, disable foreign key checks
    await db.execute('SET FOREIGN_KEY_CHECKS = 0;');

    // Get all table names
    const [tables] = await db.execute('SHOW TABLES;');
    for (const row of tables as unknown as any[]) {
      const tableName = row[Object.keys(row)[0]];
      await db.execute(`DROP TABLE IF EXISTS \`${tableName}\`;`);
    }

    // Re-enable foreign key checks
    await db.execute('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('All tables dropped successfully');
  } catch (error) {
    console.error('Error dropping tables:', error);
    process.exit(1);
  }
}

async function migrate(shouldDrop = false) {
  try {
    if (shouldDrop) {
      await dropTables();
    }

    console.log('Running migrations...');
    const migrationPath = join(process.cwd(), 'server', 'db', 'migrations', '0000_initial.sql');
    const migration = readFileSync(migrationPath, 'utf8');

    // Split the migration into individual statements
    const statements = migration.split(';').filter(stmt => stmt.trim());

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await db.execute(statement + ';');
      }
    }

    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

const shouldDrop = process.argv.includes('drop');
migrate(shouldDrop);