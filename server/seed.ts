import { db } from './db';
import * as schema from '@shared/schema';
import { nanoid } from 'nanoid';
import * as bcrypt from 'bcrypt';

async function seed() {
  try {
    // Create departments
    const departments = [
      { id: nanoid(), name: 'Information Technology', hodId: null },
      { id: nanoid(), name: 'Human Resources', hodId: null },
      { id: nanoid(), name: 'Finance', hodId: null },
      { id: nanoid(), name: 'Operations', hodId: null },
      { id: nanoid(), name: 'Marketing', hodId: null },
    ];

    console.log('Creating departments...');
    for (const dept of departments) {
      await db.insert(schema.departments).values(dept);
    }

    // Create users with hashed passwords
    const hashedPassword = await bcrypt.hash('password123', 10);
    const users = [
      {
        id: nanoid(),
        username: 'admin',
        password: hashedPassword,
        email: 'admin@example.com',
        fullName: 'System Administrator',
        role: 'PROCUREMENT_MANAGER',
        departmentId: departments[0].id,
      },
      {
        id: nanoid(),
        username: 'finance',
        password: hashedPassword,
        email: 'finance@example.com',
        fullName: 'Finance Officer',
        role: 'FINANCE_OFFICER',
        departmentId: departments[2].id,
      },
      {
        id: nanoid(),
        username: 'it_hod',
        password: hashedPassword,
        email: 'it.hod@example.com',
        fullName: 'IT HOD',
        role: 'HOD',
        departmentId: departments[0].id,
      },
    ];

    console.log('Creating users...');
    for (const user of users) {
      await db.insert(schema.users).values(user);
    }

    // Update departments with HODs
    await db.update(schema.departments)
      .set({ hodId: users[2].id })
      .where(({ id }) => id.equals(departments[0].id));

    // Create categories
    const categories = [
      { id: nanoid(), name: 'Office Supplies', description: 'General office supplies and stationery' },
      { id: nanoid(), name: 'IT Equipment', description: 'Computers, peripherals, and networking equipment' },
      { id: nanoid(), name: 'Furniture', description: 'Office furniture and fixtures' },
      { id: nanoid(), name: 'Software', description: 'Software licenses and subscriptions' },
    ];

    console.log('Creating categories...');
    for (const category of categories) {
      await db.insert(schema.categories).values(category);
    }

    // Create vendors
    const vendors = [
      {
        id: nanoid(),
        name: 'TechSupply Co',
        registrationNumber: 'TECH001',
        email: 'sales@techsupply.example.com',
        phone: '+1234567890',
        address: '123 Tech Street',
        contactPerson: 'John Tech',
        status: 'ACTIVE',
        categories: 'IT Equipment,Software',
      },
      {
        id: nanoid(),
        name: 'Office Essentials',
        registrationNumber: 'OFF001',
        email: 'sales@officeessentials.example.com',
        phone: '+1234567891',
        address: '456 Office Avenue',
        contactPerson: 'Jane Office',
        status: 'ACTIVE',
        categories: 'Office Supplies,Furniture',
      },
    ];

    console.log('Creating vendors...');
    for (const vendor of vendors) {
      await db.insert(schema.vendors).values(vendor);
    }

    // Create items
    const items = [
      {
        id: nanoid(),
        code: 'LAP001',
        name: 'Laptop Computer',
        description: 'Standard business laptop',
        categoryId: categories[1].id,
        unit: 'piece',
        minReorderLevel: 5,
        unitPrice: 1200.00,
      },
      {
        id: nanoid(),
        code: 'DSK001',
        name: 'Office Desk',
        description: 'Standard office desk',
        categoryId: categories[2].id,
        unit: 'piece',
        minReorderLevel: 2,
        unitPrice: 300.00,
      },
      {
        id: nanoid(),
        code: 'SUP001',
        name: 'Printer Paper',
        description: 'A4 printer paper, 500 sheets',
        categoryId: categories[0].id,
        unit: 'ream',
        minReorderLevel: 20,
        unitPrice: 5.00,
      },
    ];

    console.log('Creating items...');
    for (const item of items) {
      await db.insert(schema.items).values(item);
    }

    // Create initial stock for IT department
    const stocks = [
      {
        id: nanoid(),
        itemId: items[0].id,
        departmentId: departments[0].id,
        quantityAvailable: 10,
        quantityReserved: 0,
      },
      {
        id: nanoid(),
        itemId: items[1].id,
        departmentId: departments[0].id,
        quantityAvailable: 5,
        quantityReserved: 0,
      },
      {
        id: nanoid(),
        itemId: items[2].id,
        departmentId: departments[0].id,
        quantityAvailable: 50,
        quantityReserved: 0,
      },
    ];

    console.log('Creating initial stock...');
    for (const stock of stocks) {
      await db.insert(schema.stock).values(stock);
    }

    console.log('Seed data created successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

seed().catch(console.error);