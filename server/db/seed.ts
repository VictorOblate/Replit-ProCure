import { db } from '../db';
import * as schema from './migrations/0000_init';
import { v4 as uuidv4 } from 'uuid';
import { hash } from 'bcrypt';

async function seed() {
  try {
    // Seed departments
    const itDeptId = uuidv4();
    const hrDeptId = uuidv4();
    const financeDeptId = uuidv4();
    
    await db.insert(schema.departments).values([
      { id: itDeptId, name: 'Information Technology' },
      { id: hrDeptId, name: 'Human Resources' },
      { id: financeDeptId, name: 'Finance' },
    ]);

    // Seed users
    const adminPassword = await hash('admin123', 10);
    const userPassword = await hash('user123', 10);

    const adminId = uuidv4();
    const hodId = uuidv4();
    const userId = uuidv4();

    await db.insert(schema.users).values([
      {
        id: adminId,
        username: 'admin',
        password: adminPassword,
        email: 'admin@procure.com',
        fullName: 'System Administrator',
        role: 'PROCUREMENT_MANAGER',
        departmentId: itDeptId,
      },
      {
        id: hodId,
        username: 'ithod',
        password: userPassword,
        email: 'ithod@procure.com',
        fullName: 'IT Department Head',
        role: 'HOD',
        departmentId: itDeptId,
      },
      {
        id: userId,
        username: 'user',
        password: userPassword,
        email: 'user@procure.com',
        fullName: 'Regular User',
        role: 'GENERAL_USER',
        departmentId: hrDeptId,
      },
    ]);

    // Update department HOD
    await db.update(schema.departments)
      .set({ hodId })
      .where({ id: itDeptId });

    // Seed categories
    const officeSuppliesCatId = uuidv4();
    const itEquipmentCatId = uuidv4();

    await db.insert(schema.categories).values([
      {
        id: officeSuppliesCatId,
        name: 'Office Supplies',
        description: 'General office supplies and stationery',
      },
      {
        id: itEquipmentCatId,
        name: 'IT Equipment',
        description: 'Computers, peripherals, and networking equipment',
      },
    ]);

    // Seed items
    const laptopId = uuidv4();
    const printerId = uuidv4();

    await db.insert(schema.items).values([
      {
        id: laptopId,
        code: 'IT-001',
        name: 'Laptop Computer',
        description: 'Standard office laptop',
        categoryId: itEquipmentCatId,
        unit: 'piece',
        minReorderLevel: 5,
        unitPrice: 1200.00,
      },
      {
        id: printerId,
        code: 'IT-002',
        name: 'LaserJet Printer',
        description: 'Network printer',
        categoryId: itEquipmentCatId,
        unit: 'piece',
        minReorderLevel: 2,
        unitPrice: 400.00,
      },
    ]);

    // Seed initial stock
    await db.insert(schema.stock).values([
      {
        id: uuidv4(),
        itemId: laptopId,
        departmentId: itDeptId,
        quantityAvailable: 10,
      },
      {
        id: uuidv4(),
        itemId: printerId,
        departmentId: itDeptId,
        quantityAvailable: 5,
      },
    ]);

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

seed();