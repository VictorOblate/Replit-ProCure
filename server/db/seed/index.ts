import { db } from '../../db';
import { 
  departments, 
  users, 
  categories, 
  items, 
  stock, 
  vendors,
  borrowRequests,
  purchaseRequisitions,
  purchaseOrders,
  quotations,
  auditLogs,
  stockMovements
} from '@shared/schema';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';

import { hashPassword } from '../../auth';

async function seed() {
  try {
    console.log('Seeding departments...');
    const itDeptId = nanoid();
    const hrDeptId = nanoid();
    const financeDeptId = nanoid();
    const procurementDeptId = nanoid();
    const marketingDeptId = nanoid();
    
    await db.insert(departments).values([
      { id: itDeptId, name: 'Information Technology' },
      { id: hrDeptId, name: 'Human Resources' },
      { id: financeDeptId, name: 'Finance' },
      { id: procurementDeptId, name: 'Procurement' },
      { id: marketingDeptId, name: 'Marketing' }
    ]);

    console.log('Seeding users...');
    const adminId = nanoid();
    const hodItId = nanoid();
    const hodHrId = nanoid();
    const hodFinId = nanoid();
    const hodProcId = nanoid();
    const hodMarketingId = nanoid();
    const staffId1 = nanoid();
    const staffId2 = nanoid();

    const password = await hashPassword('password123');

    await db.insert(users).values([
      {
        id: adminId,
        username: 'admin',
        password,
        email: 'admin@procure.com',
        fullName: 'System Administrator',
        role: 'PROCUREMENT_MANAGER',
        departmentId: procurementDeptId
      },
      {
        id: hodItId,
        username: 'it_hod',
        password,
        email: 'it.hod@procure.com',
        fullName: 'IT Department Head',
        role: 'HOD',
        departmentId: itDeptId
      },
      {
        id: hodHrId,
        username: 'hr_hod',
        password,
        email: 'hr.hod@procure.com',
        fullName: 'HR Department Head',
        role: 'HOD',
        departmentId: hrDeptId
      },
      {
        id: hodFinId,
        username: 'finance_hod',
        password,
        email: 'finance.hod@procure.com',
        fullName: 'Finance Department Head',
        role: 'FINANCE_OFFICER',
        departmentId: financeDeptId
      },
      {
        id: hodProcId,
        username: 'proc_hod',
        password,
        email: 'proc.hod@procure.com',
        fullName: 'Procurement Department Head',
        role: 'PROCUREMENT_MANAGER',
        departmentId: procurementDeptId
      },
      {
        id: hodMarketingId,
        username: 'marketing_hod',
        password,
        email: 'marketing.hod@procure.com',
        fullName: 'Marketing Department Head',
        role: 'HOD',
        departmentId: marketingDeptId
      },
      {
        id: staffId1,
        username: 'staff1',
        password,
        email: 'staff1@procure.com',
        fullName: 'General Staff 1',
        role: 'GENERAL_USER',
        departmentId: itDeptId
      },
      {
        id: staffId2,
        username: 'staff2',
        password,
        email: 'staff2@procure.com',
        fullName: 'General Staff 2',
        role: 'GENERAL_USER',
        departmentId: hrDeptId
      }
    ]);

    console.log('Seeding categories...');
    const officeSuppliesCatId = nanoid();
    const itEquipmentCatId = nanoid();

    await db.insert(categories).values([
      {
        id: officeSuppliesCatId,
        name: 'Office Supplies',
        description: 'General office supplies and stationery',
        createdAt: new Date()
      },
      {
        id: itEquipmentCatId,
        name: 'IT Equipment',
        description: 'Computers, peripherals, and networking equipment',
        createdAt: new Date()
      },
    ]);

    // Create vendors
    console.log('Creating vendors...');
    const vendor1Id = nanoid();
    const vendor2Id = nanoid();
    const vendor3Id = nanoid();

    await db.insert(vendors).values([
      {
        id: vendor1Id,
        name: 'TechCorp Solutions',
        registrationNumber: 'TCS001',
        email: 'sales@techcorp.com',
        phone: '+1234567890',
        address: '123 Tech Street',
        contactPerson: 'John Tech',
        status: 'ACTIVE',
        categories: JSON.stringify(['IT Equipment', 'Software']),
        rating: '4.5'
      },
      {
        id: vendor2Id,
        name: 'Office Supplies Plus',
        registrationNumber: 'OSP002',
        email: 'sales@osplus.com',
        phone: '+1234567891',
        address: '456 Supply Road',
        contactPerson: 'Jane Supply',
        status: 'ACTIVE',
        categories: JSON.stringify(['Office Supplies']),
        rating: '4.0'
      },
      {
        id: vendor3Id,
        name: 'Furniture World',
        registrationNumber: 'FW003',
        email: 'sales@fworld.com',
        phone: '+1234567892',
        address: '789 Furniture Ave',
        contactPerson: 'Bob Furnish',
        status: 'ACTIVE',
        categories: JSON.stringify(['Furniture']),
        rating: '4.2'
      }
    ]);

    console.log('Seeding items...');
    const laptopId = nanoid();
    const printerId = nanoid();
    const deskId = nanoid();

    await db.insert(items).values([
      {
        id: laptopId,
        code: 'IT-001',
        name: 'Laptop Computer',
        description: 'Standard office laptop - i7, 16GB RAM, 512GB SSD',
        categoryId: itEquipmentCatId,
        unit: 'piece',
        minReorderLevel: 5,
        unitPrice: '1200.00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: printerId,
        code: 'IT-002',
        name: 'LaserJet Printer',
        description: 'Network printer - Color LaserJet Pro',
        categoryId: itEquipmentCatId,
        unit: 'piece',
        minReorderLevel: 2,
        unitPrice: '400.00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: deskId,
        code: 'OF-001',
        name: 'Office Desk',
        description: 'Standard office desk - 120x60cm',
        categoryId: officeSuppliesCatId,
        unit: 'piece',
        minReorderLevel: 3,
        unitPrice: '300.00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ]);

    console.log('Seeding stock...');
    await db.insert(stock).values([
      {
        id: nanoid(),
        itemId: laptopId,
        departmentId: itDeptId,
        quantityAvailable: 10,
        quantityReserved: 0,
        lastUpdated: new Date()
      },
      {
        id: nanoid(),
        itemId: printerId,
        departmentId: itDeptId,
        quantityAvailable: 5,
        quantityReserved: 0,
        lastUpdated: new Date()
      },
      {
        id: nanoid(),
        itemId: deskId,
        departmentId: hrDeptId,
        quantityAvailable: 8,
        quantityReserved: 0,
        lastUpdated: new Date()
      },
    ]);

    // Create a sample borrow request
    console.log('Creating sample borrow request...');
    const borrowRequestId = nanoid();
    await db.insert(borrowRequests).values([
      {
        id: borrowRequestId,
        requesterId: staffId2,
        requesterDepartmentId: hrDeptId,
        itemId: laptopId,
        owningDepartmentId: itDeptId,
        quantityRequested: 2,
        justification: 'Needed for new employees',
        requiredDate: new Date('2025-10-15'),
        status: 'PENDING',
        requesterHodApproval: 'PENDING',
        ownerHodApproval: 'PENDING',
        approvedBy: null,
        rejectionReason: null
      }
    ]);

    // Create a sample purchase requisition
    console.log('Creating sample purchase requisition...');
    const requisitionId = nanoid();
    await db.insert(purchaseRequisitions).values([
      {
        id: requisitionId,
        requesterId: staffId1,
        departmentId: itDeptId,
        itemName: 'High-Performance Laptop',
        description: 'Laptop for development team',
        quantity: 5,
        estimatedCost: '2000.00',
        justification: 'Required for new development team',
        requiredDate: new Date('2025-11-01'),
        status: 'PENDING',
        hodApproval: 'PENDING',
        procurementApproval: 'PENDING',
        financeApproval: 'PENDING'
      }
    ]);

    // Create sample quotations
    console.log('Creating sample quotations...');
    await db.insert(quotations).values([
      {
        id: nanoid(),
        requisitionId,
        vendorId: vendor1Id,
        unitPrice: '1950.00',
        totalPrice: '9750.00',
        deliveryTimeline: '2 weeks',
        validUntil: new Date('2025-10-30'),
        isSelected: false
      },
      {
        id: nanoid(),
        requisitionId,
        vendorId: vendor2Id,
        unitPrice: '2100.00',
        totalPrice: '10500.00',
        deliveryTimeline: '1 week',
        validUntil: new Date('2025-10-30'),
        isSelected: false
      }
    ]);

    // Create an audit log entry
    console.log('Creating sample audit log...');
    await db.insert(auditLogs).values([
      {
        id: nanoid(),
        userId: adminId,
        action: 'SYSTEM_INIT',
        entityType: 'SYSTEM',
        oldValues: null,
        newValues: JSON.stringify({ event: 'System Initialization' }),
        ipAddress: '127.0.0.1',
        userAgent: 'System Seed Script'
      }
    ]);

    // Create a stock movement entry
    console.log('Creating sample stock movement...');
    const stockRecord = await db.select({ id: stock.id })
      .from(stock)
      .where(eq(stock.itemId, laptopId))
      .then(rows => rows[0]);

    if (stockRecord) {
      await db.insert(stockMovements).values([
        {
          id: nanoid(),
          stockId: stockRecord.id,
          movementType: 'INITIAL_STOCK',
          quantity: 20,
          reason: 'Initial stock entry',
          performedBy: adminId
        }
      ]);
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

seed();