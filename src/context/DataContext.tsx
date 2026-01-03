import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type {
  Property,
  Unit,
  Tenant,
  Contract,
  Payment,
  MaintenanceRequest,
  DashboardKPI,
  PaymentFrequency,
  UnitStatus,
  PaymentStatus,
  MaintenanceStatus,
  Employee,
  Task,
  TaskStatus,
  TaskHistoryItem,
  Notification,
} from '../types/database';

// ========================
// CONTEXT TYPE
// ========================

interface DataContextType {
  // Data
  properties: Property[];
  units: Unit[];
  tenants: Tenant[];
  contracts: Contract[];
  payments: Payment[];
  maintenanceRequests: MaintenanceRequest[];
  employees: Employee[];
  tasks: Task[];
  notifications: Notification[];

  // KPI
  getKPI: () => DashboardKPI;

  // Properties CRUD
  addProperty: (property: Omit<Property, 'id' | 'companyId' | 'createdAt'>) => void;
  updateProperty: (id: string, property: Partial<Property>) => void;
  deleteProperty: (id: string) => void;

  // Units CRUD
  addUnit: (unit: Omit<Unit, 'id' | 'companyId' | 'createdAt'>) => void;
  updateUnit: (id: string, unit: Partial<Unit>) => void;
  deleteUnit: (id: string) => void;

  // Tenants CRUD
  addTenant: (tenant: Omit<Tenant, 'id' | 'companyId' | 'createdAt'>) => void;
  updateTenant: (id: string, tenant: Partial<Tenant>) => void;
  deleteTenant: (id: string) => void;

  // Contracts CRUD (auto-generates payments)
  addContract: (contract: Omit<Contract, 'id' | 'companyId' | 'createdAt'>) => void;
  updateContract: (id: string, contract: Partial<Contract>) => void;
  deleteContract: (id: string) => void;

  // Payments
  recordPayment: (paymentId: string, method: 'cash' | 'bank' | 'online', reference?: string) => void;

  // Maintenance CRUD
  addMaintenanceRequest: (request: Omit<MaintenanceRequest, 'id' | 'companyId' | 'createdAt'>) => void;
  updateMaintenanceRequest: (id: string, request: Partial<MaintenanceRequest>) => void;
  deleteMaintenanceRequest: (id: string) => void;

  // Employees CRUD
  addEmployee: (employee: Omit<Employee, 'id' | 'companyId' | 'createdAt'>) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  // Tasks CRUD
  addTask: (task: Omit<Task, 'id' | 'companyId' | 'createdAt' | 'updatedAt' | 'history' | 'comments'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  transferTask: (taskId: string, toEmployeeId: string, toEmployeeName: string, note?: string) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// ========================
// HELPER: Generate Payment Schedule
// ========================

function generatePaymentSchedule(
  contractId: string,
  tenantName: string,
  unitNo: string,
  startDate: string,
  endDate: string,
  rentAmount: number,
  frequency: PaymentFrequency
): Payment[] {
  const payments: Payment[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();

  let monthIncrement = 1;
  if (frequency === 'quarterly') monthIncrement = 3;
  if (frequency === 'yearly') monthIncrement = 12;

  let current = new Date(start);
  let index = 0;

  while (current <= end) {
    const dueDate = current.toISOString().split('T')[0];
    const isPast = new Date(dueDate) < today;

    payments.push({
      id: `pay-${contractId}-${index}`,
      companyId: 'demo-company',
      contractId,
      tenantName,
      unitNo,
      dueDate,
      amount: rentAmount,
      status: isPast ? 'overdue' : 'due',
      createdAt: new Date().toISOString(),
    });

    index++;
    current.setMonth(current.getMonth() + monthIncrement);
  }

  return payments;
}

// ========================
// INITIAL SEED DATA
// ========================

const DEMO_COMPANY_ID = 'demo-company';

const initialProperties: Property[] = [
  {
    id: 'prop-1',
    companyId: DEMO_COMPANY_ID,
    name: 'برج الياسمين',
    city: 'الرياض',
    address: 'حي النرجس، شارع التخصصي',
    type: 'building',
    notes: 'برج سكني فاخر يحتوي على 50 وحدة سكنية بمواصفات عالية',
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'prop-2',
    companyId: DEMO_COMPANY_ID,
    name: 'مجمع الورود السكني',
    city: 'جدة',
    address: 'حي الزهراء، طريق الملك عبدالعزيز',
    type: 'complex',
    notes: 'مجمع سكني متكامل بخدمات ومرافق متنوعة',
    images: ['https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800'],
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'prop-3',
    companyId: DEMO_COMPANY_ID,
    name: 'فلل الربيع',
    city: 'الدمام',
    address: 'حي الفيصلية',
    type: 'villa',
    notes: 'فلل سكنية راقية بتصاميم عصرية',
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
    createdAt: '2024-02-01T00:00:00Z',
  },
];

const initialUnits: Unit[] = [
  // برج الياسمين - 10 وحدات
  { id: 'unit-1', companyId: DEMO_COMPANY_ID, propertyId: 'prop-1', propertyName: 'برج الياسمين', unitNo: 'A-101', type: 'apartment', floor: '1', bedrooms: 3, bathrooms: 2, areaSqm: 180, rentAmount: 45000, status: 'rented', images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'], createdAt: '2024-01-01' },
  { id: 'unit-2', companyId: DEMO_COMPANY_ID, propertyId: 'prop-1', propertyName: 'برج الياسمين', unitNo: 'A-102', type: 'apartment', floor: '1', bedrooms: 2, bathrooms: 1, areaSqm: 120, rentAmount: 35000, status: 'vacant', images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'], createdAt: '2024-01-01' },
  { id: 'unit-3', companyId: DEMO_COMPANY_ID, propertyId: 'prop-1', propertyName: 'برج الياسمين', unitNo: 'A-201', type: 'apartment', floor: '2', bedrooms: 3, bathrooms: 2, areaSqm: 180, rentAmount: 48000, status: 'rented', images: [], createdAt: '2024-01-01' },
  { id: 'unit-4', companyId: DEMO_COMPANY_ID, propertyId: 'prop-1', propertyName: 'برج الياسمين', unitNo: 'A-202', type: 'apartment', floor: '2', bedrooms: 2, bathrooms: 1, areaSqm: 120, rentAmount: 36000, status: 'rented', images: [], createdAt: '2024-01-01' },
  { id: 'unit-5', companyId: DEMO_COMPANY_ID, propertyId: 'prop-1', propertyName: 'برج الياسمين', unitNo: 'A-301', type: 'apartment', floor: '3', bedrooms: 4, bathrooms: 3, areaSqm: 220, rentAmount: 55000, status: 'maintenance', images: [], createdAt: '2024-01-01' },
  { id: 'unit-6', companyId: DEMO_COMPANY_ID, propertyId: 'prop-1', propertyName: 'برج الياسمين', unitNo: 'A-302', type: 'apartment', floor: '3', bedrooms: 2, bathrooms: 1, areaSqm: 110, rentAmount: 32000, status: 'rented', images: [], createdAt: '2024-01-01' },
  { id: 'unit-7', companyId: DEMO_COMPANY_ID, propertyId: 'prop-1', propertyName: 'برج الياسمين', unitNo: 'A-401', type: 'apartment', floor: '4', bedrooms: 3, bathrooms: 2, areaSqm: 180, rentAmount: 50000, status: 'vacant', images: [], createdAt: '2024-01-01' },
  { id: 'unit-8', companyId: DEMO_COMPANY_ID, propertyId: 'prop-1', propertyName: 'برج الياسمين', unitNo: 'A-402', type: 'studio', floor: '4', bedrooms: 1, bathrooms: 1, areaSqm: 80, rentAmount: 25000, status: 'rented', images: [], createdAt: '2024-01-01' },
  { id: 'unit-9', companyId: DEMO_COMPANY_ID, propertyId: 'prop-1', propertyName: 'برج الياسمين', unitNo: 'A-501', type: 'apartment', floor: '5', bedrooms: 5, bathrooms: 4, areaSqm: 300, rentAmount: 75000, status: 'rented', images: [], createdAt: '2024-01-01' },
  { id: 'unit-10', companyId: DEMO_COMPANY_ID, propertyId: 'prop-1', propertyName: 'برج الياسمين', unitNo: 'A-502', type: 'apartment', floor: '5', bedrooms: 2, bathrooms: 2, areaSqm: 130, rentAmount: 38000, status: 'vacant', images: [], createdAt: '2024-01-01' },

  // مجمع الورود - 10 وحدات
  { id: 'unit-11', companyId: DEMO_COMPANY_ID, propertyId: 'prop-2', propertyName: 'مجمع الورود السكني', unitNo: 'B-101', type: 'apartment', floor: '1', bedrooms: 3, bathrooms: 2, areaSqm: 160, rentAmount: 42000, status: 'rented', images: [], createdAt: '2024-01-15' },
  { id: 'unit-12', companyId: DEMO_COMPANY_ID, propertyId: 'prop-2', propertyName: 'مجمع الورود السكني', unitNo: 'B-102', type: 'apartment', floor: '1', bedrooms: 2, bathrooms: 1, areaSqm: 100, rentAmount: 30000, status: 'rented', images: [], createdAt: '2024-01-15' },
  { id: 'unit-13', companyId: DEMO_COMPANY_ID, propertyId: 'prop-2', propertyName: 'مجمع الورود السكني', unitNo: 'B-201', type: 'apartment', floor: '2', bedrooms: 4, bathrooms: 3, areaSqm: 200, rentAmount: 55000, status: 'rented', images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'], createdAt: '2024-01-15' },
  { id: 'unit-14', companyId: DEMO_COMPANY_ID, propertyId: 'prop-2', propertyName: 'مجمع الورود السكني', unitNo: 'B-202', type: 'apartment', floor: '2', bedrooms: 2, bathrooms: 1, areaSqm: 95, rentAmount: 28000, status: 'vacant', images: [], createdAt: '2024-01-15' },
  { id: 'unit-15', companyId: DEMO_COMPANY_ID, propertyId: 'prop-2', propertyName: 'مجمع الورود السكني', unitNo: 'B-301', type: 'apartment', floor: '3', bedrooms: 3, bathrooms: 2, areaSqm: 165, rentAmount: 44000, status: 'rented', images: [], createdAt: '2024-01-15' },
  { id: 'unit-16', companyId: DEMO_COMPANY_ID, propertyId: 'prop-2', propertyName: 'مجمع الورود السكني', unitNo: 'B-302', type: 'studio', floor: '3', bedrooms: 1, bathrooms: 1, areaSqm: 70, rentAmount: 22000, status: 'maintenance', images: [], createdAt: '2024-01-15' },
  { id: 'unit-17', companyId: DEMO_COMPANY_ID, propertyId: 'prop-2', propertyName: 'مجمع الورود السكني', unitNo: 'B-401', type: 'apartment', floor: '4', bedrooms: 4, bathrooms: 3, areaSqm: 210, rentAmount: 58000, status: 'vacant', images: [], createdAt: '2024-01-15' },
  { id: 'unit-18', companyId: DEMO_COMPANY_ID, propertyId: 'prop-2', propertyName: 'مجمع الورود السكني', unitNo: 'B-402', type: 'apartment', floor: '4', bedrooms: 2, bathrooms: 2, areaSqm: 115, rentAmount: 34000, status: 'rented', images: [], createdAt: '2024-01-15' },
  { id: 'unit-19', companyId: DEMO_COMPANY_ID, propertyId: 'prop-2', propertyName: 'مجمع الورود السكني', unitNo: 'B-501', type: 'apartment', floor: '5', bedrooms: 5, bathrooms: 4, areaSqm: 280, rentAmount: 70000, status: 'rented', images: [], createdAt: '2024-01-15' },
  { id: 'unit-20', companyId: DEMO_COMPANY_ID, propertyId: 'prop-2', propertyName: 'مجمع الورود السكني', unitNo: 'B-502', type: 'apartment', floor: '5', bedrooms: 3, bathrooms: 2, areaSqm: 155, rentAmount: 40000, status: 'vacant', images: [], createdAt: '2024-01-15' },

  // فلل الربيع - 5 وحدات
  { id: 'unit-21', companyId: DEMO_COMPANY_ID, propertyId: 'prop-3', propertyName: 'فلل الربيع', unitNo: 'V-01', type: 'villa', floor: 'أرضي', bedrooms: 5, bathrooms: 4, areaSqm: 400, rentAmount: 120000, status: 'rented', images: [], createdAt: '2024-02-01' },
  { id: 'unit-22', companyId: DEMO_COMPANY_ID, propertyId: 'prop-3', propertyName: 'فلل الربيع', unitNo: 'V-02', type: 'villa', floor: 'أرضي', bedrooms: 4, bathrooms: 3, areaSqm: 350, rentAmount: 95000, status: 'rented', images: [], createdAt: '2024-02-01' },
  { id: 'unit-23', companyId: DEMO_COMPANY_ID, propertyId: 'prop-3', propertyName: 'فلل الربيع', unitNo: 'V-03', type: 'villa', floor: 'أرضي', bedrooms: 6, bathrooms: 5, areaSqm: 500, rentAmount: 150000, status: 'vacant', images: [], createdAt: '2024-02-01' },
  { id: 'unit-24', companyId: DEMO_COMPANY_ID, propertyId: 'prop-3', propertyName: 'فلل الربيع', unitNo: 'V-04', type: 'villa', floor: 'أرضي', bedrooms: 4, bathrooms: 3, areaSqm: 320, rentAmount: 85000, status: 'rented', images: [], createdAt: '2024-02-01' },
  { id: 'unit-25', companyId: DEMO_COMPANY_ID, propertyId: 'prop-3', propertyName: 'فلل الربيع', unitNo: 'V-05', type: 'villa', floor: 'أرضي', bedrooms: 5, bathrooms: 4, areaSqm: 420, rentAmount: 110000, status: 'rented', images: [], createdAt: '2024-02-01' },
];

const initialTenants: Tenant[] = [
  { id: 'tenant-1', companyId: DEMO_COMPANY_ID, fullName: 'محمد أحمد السعيد', nationalId: '1100000001', phone: '0501234567', email: 'mohammed@email.com', createdAt: '2024-01-01' },
  { id: 'tenant-2', companyId: DEMO_COMPANY_ID, fullName: 'فاطمة علي الزهراني', nationalId: '1100000002', phone: '0557654321', email: 'fatima@email.com', createdAt: '2024-01-05' },
  { id: 'tenant-3', companyId: DEMO_COMPANY_ID, fullName: 'عبدالله خالد المطيري', nationalId: '1100000003', phone: '0569876543', email: 'abdullah@email.com', createdAt: '2024-01-10' },
  { id: 'tenant-4', companyId: DEMO_COMPANY_ID, fullName: 'نورة سعد القحطاني', nationalId: '1100000004', phone: '0541112233', email: 'noura@email.com', createdAt: '2024-01-15' },
  { id: 'tenant-5', companyId: DEMO_COMPANY_ID, fullName: 'سعود محمد العتيبي', nationalId: '1100000005', phone: '0522223344', email: 'saud@email.com', createdAt: '2024-02-01' },
  { id: 'tenant-6', companyId: DEMO_COMPANY_ID, fullName: 'هند عبدالرحمن الشمري', nationalId: '1100000006', phone: '0533334455', email: 'hind@email.com', createdAt: '2024-02-10' },
  { id: 'tenant-7', companyId: DEMO_COMPANY_ID, fullName: 'خالد إبراهيم الدوسري', nationalId: '1100000007', phone: '0544445566', email: 'khaled@email.com', createdAt: '2024-02-15' },
  { id: 'tenant-8', companyId: DEMO_COMPANY_ID, fullName: 'ريم فهد الحربي', nationalId: '1100000008', phone: '0555556677', email: 'reem@email.com', createdAt: '2024-03-01' },
  { id: 'tenant-9', companyId: DEMO_COMPANY_ID, fullName: 'يوسف حسن الغامدي', nationalId: '1100000009', phone: '0566667788', email: 'yousef@email.com', createdAt: '2024-03-10' },
  { id: 'tenant-10', companyId: DEMO_COMPANY_ID, fullName: 'سارة عمر البلوي', nationalId: '1100000010', phone: '0577778899', email: 'sara@email.com', createdAt: '2024-03-15' },
];

const initialContracts: Contract[] = [
  { id: 'contract-1', companyId: DEMO_COMPANY_ID, propertyId: 'prop-1', propertyName: 'برج الياسمين', unitId: 'unit-1', unitNo: 'A-101', tenantId: 'tenant-1', tenantName: 'محمد أحمد السعيد', startDate: '2024-01-01', endDate: '2024-12-31', rentAmount: 45000, paymentFrequency: 'monthly', depositAmount: 45000, status: 'active', createdAt: '2024-01-01' },
  { id: 'contract-2', companyId: DEMO_COMPANY_ID, propertyId: 'prop-1', propertyName: 'برج الياسمين', unitId: 'unit-3', unitNo: 'A-201', tenantId: 'tenant-2', tenantName: 'فاطمة علي الزهراني', startDate: '2024-02-01', endDate: '2025-01-31', rentAmount: 48000, paymentFrequency: 'monthly', depositAmount: 48000, status: 'active', createdAt: '2024-02-01' },
  { id: 'contract-3', companyId: DEMO_COMPANY_ID, propertyId: 'prop-1', propertyName: 'برج الياسمين', unitId: 'unit-4', unitNo: 'A-202', tenantId: 'tenant-3', tenantName: 'عبدالله خالد المطيري', startDate: '2024-03-01', endDate: '2025-02-28', rentAmount: 36000, paymentFrequency: 'quarterly', depositAmount: 36000, status: 'active', createdAt: '2024-03-01' },
  { id: 'contract-4', companyId: DEMO_COMPANY_ID, propertyId: 'prop-1', propertyName: 'برج الياسمين', unitId: 'unit-6', unitNo: 'A-302', tenantId: 'tenant-4', tenantName: 'نورة سعد القحطاني', startDate: '2024-04-01', endDate: '2025-03-31', rentAmount: 32000, paymentFrequency: 'monthly', depositAmount: 32000, status: 'active', createdAt: '2024-04-01' },
  { id: 'contract-5', companyId: DEMO_COMPANY_ID, propertyId: 'prop-1', propertyName: 'برج الياسمين', unitId: 'unit-8', unitNo: 'A-402', tenantId: 'tenant-5', tenantName: 'سعود محمد العتيبي', startDate: '2024-05-01', endDate: '2025-04-30', rentAmount: 25000, paymentFrequency: 'monthly', depositAmount: 25000, status: 'active', createdAt: '2024-05-01' },
  { id: 'contract-6', companyId: DEMO_COMPANY_ID, propertyId: 'prop-1', propertyName: 'برج الياسمين', unitId: 'unit-9', unitNo: 'A-501', tenantId: 'tenant-6', tenantName: 'هند عبدالرحمن الشمري', startDate: '2024-06-01', endDate: '2025-05-31', rentAmount: 75000, paymentFrequency: 'yearly', depositAmount: 75000, status: 'active', createdAt: '2024-06-01' },
  { id: 'contract-7', companyId: DEMO_COMPANY_ID, propertyId: 'prop-2', propertyName: 'مجمع الورود السكني', unitId: 'unit-11', unitNo: 'B-101', tenantId: 'tenant-7', tenantName: 'خالد إبراهيم الدوسري', startDate: '2024-03-01', endDate: '2025-02-28', rentAmount: 42000, paymentFrequency: 'monthly', depositAmount: 42000, status: 'active', createdAt: '2024-03-01' },
  { id: 'contract-8', companyId: DEMO_COMPANY_ID, propertyId: 'prop-2', propertyName: 'مجمع الورود السكني', unitId: 'unit-12', unitNo: 'B-102', tenantId: 'tenant-8', tenantName: 'ريم فهد الحربي', startDate: '2024-04-01', endDate: '2025-03-31', rentAmount: 30000, paymentFrequency: 'monthly', depositAmount: 30000, status: 'active', createdAt: '2024-04-01' },
  { id: 'contract-9', companyId: DEMO_COMPANY_ID, propertyId: 'prop-3', propertyName: 'فلل الربيع', unitId: 'unit-21', unitNo: 'V-01', tenantId: 'tenant-9', tenantName: 'يوسف حسن الغامدي', startDate: '2024-02-01', endDate: '2025-01-31', rentAmount: 120000, paymentFrequency: 'yearly', depositAmount: 120000, status: 'active', createdAt: '2024-02-01' },
  { id: 'contract-10', companyId: DEMO_COMPANY_ID, propertyId: 'prop-3', propertyName: 'فلل الربيع', unitId: 'unit-22', unitNo: 'V-02', tenantId: 'tenant-10', tenantName: 'سارة عمر البلوي', startDate: '2024-03-01', endDate: '2025-02-28', rentAmount: 95000, paymentFrequency: 'quarterly', depositAmount: 95000, status: 'active', createdAt: '2024-03-01' },
  // عقود منتهية قريباً
  { id: 'contract-11', companyId: DEMO_COMPANY_ID, propertyId: 'prop-2', propertyName: 'مجمع الورود السكني', unitId: 'unit-13', unitNo: 'B-201', tenantId: 'tenant-1', tenantName: 'محمد أحمد السعيد', startDate: '2024-01-15', endDate: '2025-01-14', rentAmount: 55000, paymentFrequency: 'monthly', depositAmount: 55000, status: 'active', createdAt: '2024-01-15' },
  { id: 'contract-12', companyId: DEMO_COMPANY_ID, propertyId: 'prop-2', propertyName: 'مجمع الورود السكني', unitId: 'unit-15', unitNo: 'B-301', tenantId: 'tenant-2', tenantName: 'فاطمة علي الزهراني', startDate: '2024-02-01', endDate: '2025-01-31', rentAmount: 44000, paymentFrequency: 'monthly', depositAmount: 44000, status: 'active', createdAt: '2024-02-01' },
];

// Generate initial payments from contracts
function generateInitialPayments(): Payment[] {
  const allPayments: Payment[] = [];

  initialContracts.forEach(contract => {
    const payments = generatePaymentSchedule(
      contract.id,
      contract.tenantName,
      contract.unitNo,
      contract.startDate,
      contract.endDate,
      contract.rentAmount,
      contract.paymentFrequency
    );

    // Mark some as paid (past 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    payments.forEach(payment => {
      const dueDate = new Date(payment.dueDate);
      if (dueDate < sixMonthsAgo) {
        payment.status = 'paid';
        payment.paidAt = payment.dueDate;
        payment.method = Math.random() > 0.5 ? 'bank' : 'cash';
      }
    });

    allPayments.push(...payments);
  });

  return allPayments;
}

const initialMaintenanceRequests: MaintenanceRequest[] = [
  { id: 'maint-1', companyId: DEMO_COMPANY_ID, propertyId: 'prop-1', propertyName: 'برج الياسمين', unitId: 'unit-1', unitNo: 'A-101', title: 'تسريب في الحمام', description: 'يوجد تسريب مياه في حمام الغرفة الرئيسية', priority: 'high', status: 'in_progress', cost: 500, requestedBy: 'tenant', assignedTo: 'أحمد السباك', createdAt: '2024-12-05' },
  { id: 'maint-2', companyId: DEMO_COMPANY_ID, propertyId: 'prop-2', propertyName: 'مجمع الورود السكني', unitId: 'unit-13', unitNo: 'B-201', title: 'عطل في المكيف', description: 'المكيف لا يعمل بشكل صحيح', priority: 'medium', status: 'new', cost: 0, requestedBy: 'tenant', createdAt: '2024-12-20' },
  { id: 'maint-3', companyId: DEMO_COMPANY_ID, propertyId: 'prop-1', propertyName: 'برج الياسمين', unitId: 'unit-5', unitNo: 'A-301', title: 'تجديد الدهانات', description: 'تجديد دهانات الشقة بالكامل', priority: 'low', status: 'in_progress', cost: 3000, requestedBy: 'admin', assignedTo: 'شركة الديكور', createdAt: '2024-12-01' },
  { id: 'maint-4', companyId: DEMO_COMPANY_ID, propertyId: 'prop-3', propertyName: 'فلل الربيع', unitId: 'unit-21', unitNo: 'V-01', title: 'صيانة المسبح', description: 'تنظيف وصيانة دورية للمسبح', priority: 'medium', status: 'done', cost: 1500, requestedBy: 'admin', assignedTo: 'شركة المسابح', createdAt: '2024-11-15' },
  { id: 'maint-5', companyId: DEMO_COMPANY_ID, propertyId: 'prop-1', propertyName: 'برج الياسمين', unitId: 'unit-3', unitNo: 'A-201', title: 'تغيير الأقفال', description: 'تغيير كافة أقفال الشقة', priority: 'urgent', status: 'new', cost: 0, requestedBy: 'tenant', createdAt: '2024-12-25' },
  { id: 'maint-6', companyId: DEMO_COMPANY_ID, propertyId: 'prop-2', propertyName: 'مجمع الورود السكني', unitId: 'unit-16', unitNo: 'B-302', title: 'إصلاح السخان', description: 'السخان لا يسخن الماء', priority: 'high', status: 'in_progress', cost: 800, requestedBy: 'tenant', assignedTo: 'فني الكهرباء', createdAt: '2024-12-18' },
  { id: 'maint-7', companyId: DEMO_COMPANY_ID, propertyId: 'prop-3', propertyName: 'فلل الربيع', unitId: 'unit-22', unitNo: 'V-02', title: 'صيانة الحديقة', description: 'قص العشب وتنظيف الحديقة', priority: 'low', status: 'done', cost: 400, requestedBy: 'admin', createdAt: '2024-12-10' },
  { id: 'maint-8', companyId: DEMO_COMPANY_ID, propertyId: 'prop-1', propertyName: 'برج الياسمين', unitId: 'unit-9', unitNo: 'A-501', title: 'فحص كهرباء', description: 'فحص الأسلاك الكهربائية', priority: 'medium', status: 'new', cost: 0, requestedBy: 'admin', createdAt: '2024-12-22' },
];

// ========================
// INITIAL EMPLOYEES
// ========================

// Default all permissions for admin
const allPermissions: { module: 'properties' | 'units' | 'tenants' | 'contracts' | 'payments' | 'maintenance' | 'reports' | 'settings' | 'sales' | 'employees' | 'tasks', actions: ('view' | 'create' | 'edit' | 'delete')[] }[] = [
  { module: 'properties', actions: ['view', 'create', 'edit', 'delete'] },
  { module: 'units', actions: ['view', 'create', 'edit', 'delete'] },
  { module: 'tenants', actions: ['view', 'create', 'edit', 'delete'] },
  { module: 'contracts', actions: ['view', 'create', 'edit', 'delete'] },
  { module: 'payments', actions: ['view', 'create', 'edit', 'delete'] },
  { module: 'maintenance', actions: ['view', 'create', 'edit', 'delete'] },
  { module: 'reports', actions: ['view'] },
  { module: 'settings', actions: ['view', 'edit'] },
  { module: 'sales', actions: ['view', 'create', 'edit', 'delete'] },
  { module: 'employees', actions: ['view', 'create', 'edit', 'delete'] },
  { module: 'tasks', actions: ['view', 'create', 'edit', 'delete'] },
];

const initialEmployees: Employee[] = [
  {
    id: 'emp-1',
    companyId: DEMO_COMPANY_ID,
    fullName: 'أحمد محمد الأدمن',
    email: 'admin@arkan.sa',
    password: 'Admin@2024',
    phone: '0501234567',
    role: 'admin',
    department: 'الإدارة',
    joinDate: '2023-01-01',
    status: 'active',
    permissions: [...allPermissions],
    isActive: true,
    createdAt: '2023-01-01'
  },
  {
    id: 'emp-2',
    companyId: DEMO_COMPANY_ID,
    fullName: 'سارة أحمد',
    email: 'sara@arkan.sa',
    password: 'Sara@2024',
    phone: '0502345678',
    role: 'manager',
    department: 'إدارة العقارات',
    joinDate: '2023-03-15',
    status: 'active',
    permissions: [
      { module: 'properties', actions: ['view', 'create', 'edit'] },
      { module: 'units', actions: ['view', 'create', 'edit'] },
      { module: 'tenants', actions: ['view', 'create', 'edit'] },
      { module: 'contracts', actions: ['view', 'create', 'edit'] },
      { module: 'maintenance', actions: ['view', 'create', 'edit'] },
      { module: 'reports', actions: ['view'] },
      { module: 'tasks', actions: ['view', 'create', 'edit'] },
    ],
    isActive: true,
    createdAt: '2023-03-15'
  },
  {
    id: 'emp-3',
    companyId: DEMO_COMPANY_ID,
    fullName: 'خالد العتيبي',
    email: 'khaled@arkan.sa',
    password: 'Khaled@2024',
    phone: '0503456789',
    role: 'accountant',
    department: 'المالية',
    joinDate: '2023-06-01',
    status: 'active',
    permissions: [
      { module: 'payments', actions: ['view', 'create', 'edit', 'delete'] },
      { module: 'contracts', actions: ['view'] },
      { module: 'reports', actions: ['view'] },
      { module: 'sales', actions: ['view', 'create', 'edit', 'delete'] },
    ],
    isActive: true,
    createdAt: '2023-06-01'
  },
  {
    id: 'emp-4',
    companyId: DEMO_COMPANY_ID,
    fullName: 'محمد السباك',
    email: 'mohammed@arkan.sa',
    password: 'Mohammed@2024',
    phone: '0504567890',
    role: 'maintenance',
    department: 'الصيانة',
    joinDate: '2023-08-10',
    status: 'active',
    permissions: [
      { module: 'maintenance', actions: ['view', 'create', 'edit'] },
      { module: 'units', actions: ['view'] },
      { module: 'tasks', actions: ['view', 'edit'] },
    ],
    isActive: true,
    createdAt: '2023-08-10'
  },
  {
    id: 'emp-5',
    companyId: DEMO_COMPANY_ID,
    fullName: 'فاطمة الزهراني',
    email: 'fatima@arkan.sa',
    password: 'Fatima@2024',
    phone: '0505678901',
    role: 'employee',
    department: 'خدمة العملاء',
    joinDate: '2024-01-15',
    status: 'active',
    permissions: [
      { module: 'tenants', actions: ['view', 'create', 'edit'] },
      { module: 'contracts', actions: ['view'] },
      { module: 'properties', actions: ['view'] },
      { module: 'units', actions: ['view'] },
    ],
    isActive: true,
    createdAt: '2024-01-15'
  },
  {
    id: 'emp-6',
    companyId: DEMO_COMPANY_ID,
    fullName: 'عبدالله الدوسري',
    email: 'abdullah@arkan.sa',
    password: 'Abdullah@2024',
    phone: '0506789012',
    role: 'employee',
    department: 'إدارة العقارات',
    joinDate: '2024-03-01',
    status: 'active',
    permissions: [
      { module: 'properties', actions: ['view'] },
      { module: 'units', actions: ['view'] },
      { module: 'maintenance', actions: ['view', 'create'] },
    ],
    isActive: true,
    createdAt: '2024-03-01'
  },
];

// ========================
// INITIAL TASKS
// ========================

const initialTasks: Task[] = [
  {
    id: 'task-1',
    companyId: DEMO_COMPANY_ID,
    title: 'مراجعة عقود المستأجرين المنتهية',
    description: 'مراجعة جميع العقود التي ستنتهي خلال الشهر القادم والتواصل مع المستأجرين للتجديد',
    priority: 'high',
    status: 'in_progress',
    assignedTo: 'emp-2',
    assignedToName: 'سارة أحمد',
    createdBy: 'emp-1',
    createdByName: 'أحمد محمد الأدمن',
    dueDate: '2026-01-15',
    comments: [],
    history: [{ id: 'h1', action: 'created', createdBy: 'emp-1', createdByName: 'أحمد محمد الأدمن', createdAt: '2024-12-20' }],
    createdAt: '2024-12-20',
    updatedAt: '2024-12-20'
  },
  {
    id: 'task-2',
    companyId: DEMO_COMPANY_ID,
    title: 'تحصيل الإيجارات المتأخرة',
    description: 'متابعة تحصيل الإيجارات المتأخرة من المستأجرين وإرسال إشعارات',
    priority: 'urgent',
    status: 'pending',
    assignedTo: 'emp-3',
    assignedToName: 'خالد العتيبي',
    createdBy: 'emp-1',
    createdByName: 'أحمد محمد الأدمن',
    dueDate: '2026-01-10',
    comments: [],
    history: [{ id: 'h2', action: 'created', createdBy: 'emp-1', createdByName: 'أحمد محمد الأدمن', createdAt: '2024-12-22' }],
    createdAt: '2024-12-22',
    updatedAt: '2024-12-22'
  },
  {
    id: 'task-3',
    companyId: DEMO_COMPANY_ID,
    title: 'صيانة وحدة A-301',
    description: 'إصلاح تسريب المياه في الحمام الرئيسي',
    priority: 'high',
    status: 'in_progress',
    assignedTo: 'emp-4',
    assignedToName: 'محمد السباك',
    createdBy: 'emp-2',
    createdByName: 'سارة أحمد',
    dueDate: '2026-01-05',
    relatedTo: { type: 'maintenance', id: 'maint-1', name: 'تسريب في الحمام' },
    comments: [],
    history: [{ id: 'h3', action: 'created', createdBy: 'emp-2', createdByName: 'سارة أحمد', createdAt: '2024-12-25' }],
    createdAt: '2024-12-25',
    updatedAt: '2024-12-25'
  },
  {
    id: 'task-4',
    companyId: DEMO_COMPANY_ID,
    title: 'تحديث بيانات العقارات',
    description: 'تحديث صور ومعلومات العقارات في النظام',
    priority: 'medium',
    status: 'pending',
    assignedTo: 'emp-5',
    assignedToName: 'فاطمة الزهراني',
    createdBy: 'emp-2',
    createdByName: 'سارة أحمد',
    dueDate: '2026-01-20',
    comments: [],
    history: [{ id: 'h4', action: 'created', createdBy: 'emp-2', createdByName: 'سارة أحمد', createdAt: '2024-12-28' }],
    createdAt: '2024-12-28',
    updatedAt: '2024-12-28'
  },
  {
    id: 'task-5',
    companyId: DEMO_COMPANY_ID,
    title: 'جولة تفقدية للوحدات الشاغرة',
    description: 'القيام بجولة تفقدية لجميع الوحدات الشاغرة وإعداد تقرير',
    priority: 'low',
    status: 'completed',
    assignedTo: 'emp-6',
    assignedToName: 'عبدالله الدوسري',
    createdBy: 'emp-2',
    createdByName: 'سارة أحمد',
    dueDate: '2024-12-30',
    comments: [],
    history: [
      { id: 'h5', action: 'created', createdBy: 'emp-2', createdByName: 'سارة أحمد', createdAt: '2024-12-20' },
      { id: 'h6', action: 'status_changed', fromStatus: 'pending', toStatus: 'completed', createdBy: 'emp-6', createdByName: 'عبدالله الدوسري', createdAt: '2024-12-29' }
    ],
    createdAt: '2024-12-20',
    updatedAt: '2024-12-29'
  },
];

// ========================
// INITIAL NOTIFICATIONS
// ========================

const initialNotifications: Notification[] = [
  { id: 'notif-1', companyId: DEMO_COMPANY_ID, userId: 'emp-2', type: 'task_assigned', title: 'مهمة جديدة', message: 'تم تعيين مهمة "مراجعة عقود المستأجرين" لك', read: false, relatedId: 'task-1', createdAt: '2024-12-20' },
  { id: 'notif-2', companyId: DEMO_COMPANY_ID, userId: 'emp-3', type: 'task_assigned', title: 'مهمة جديدة', message: 'تم تعيين مهمة "تحصيل الإيجارات المتأخرة" لك', read: false, relatedId: 'task-2', createdAt: '2024-12-22' },
  { id: 'notif-3', companyId: DEMO_COMPANY_ID, userId: 'emp-1', type: 'contract_expiring', title: 'عقد ينتهي قريباً', message: 'عقد المستأجر محمد أحمد السعيد ينتهي خلال 15 يوم', read: true, relatedId: 'contract-11', createdAt: '2024-12-28' },
];

// ========================
// DATA PROVIDER
// ========================

export function DataProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [payments, setPayments] = useState<Payment[]>(generateInitialPayments());
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>(initialMaintenanceRequests);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  // ========================
  // KPI CALCULATION
  // ========================

  const getKPI = useCallback((): DashboardKPI => {
    const totalUnits = units.length;
    const vacantUnits = units.filter(u => u.status === 'vacant').length;
    const rentedUnits = units.filter(u => u.status === 'rented').length;
    const maintenanceUnits = units.filter(u => u.status === 'maintenance').length;
    const occupancyRate = totalUnits > 0 ? (rentedUnits / totalUnits) * 100 : 0;

    const activeContracts = contracts.filter(c => c.status === 'active');
    const expectedMonthlyIncome = activeContracts.reduce((sum, c) => {
      if (c.paymentFrequency === 'monthly') return sum + c.rentAmount;
      if (c.paymentFrequency === 'quarterly') return sum + (c.rentAmount / 3);
      if (c.paymentFrequency === 'yearly') return sum + (c.rentAmount / 12);
      return sum;
    }, 0);

    const overduePayments = payments.filter(p => p.status === 'overdue');
    const overdueAmount = overduePayments.reduce((sum, p) => sum + p.amount, 0);
    const overdueCount = overduePayments.length;

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const contractsExpiringSoon = contracts.filter(c => {
      const endDate = new Date(c.endDate);
      return c.status === 'active' && endDate <= thirtyDaysFromNow;
    }).length;

    return {
      totalUnits,
      vacantUnits,
      rentedUnits,
      maintenanceUnits,
      occupancyRate,
      expectedMonthlyIncome,
      overdueAmount,
      overdueCount,
      contractsExpiringSoon,
    };
  }, [units, contracts, payments]);

  // ========================
  // PROPERTIES CRUD
  // ========================

  const addProperty = (property: Omit<Property, 'id' | 'companyId' | 'createdAt'>) => {
    const newProperty: Property = {
      ...property,
      id: `prop-${Date.now()}`,
      companyId: DEMO_COMPANY_ID,
      createdAt: new Date().toISOString(),
    };
    setProperties(prev => [...prev, newProperty]);
  };

  const updateProperty = (id: string, property: Partial<Property>) => {
    setProperties(prev => prev.map(p => p.id === id ? { ...p, ...property } : p));
  };

  const deleteProperty = (id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
    // Also delete related units
    setUnits(prev => prev.filter(u => u.propertyId !== id));
  };

  // ========================
  // UNITS CRUD
  // ========================

  const addUnit = (unit: Omit<Unit, 'id' | 'companyId' | 'createdAt'>) => {
    const newUnit: Unit = {
      ...unit,
      id: `unit-${Date.now()}`,
      companyId: DEMO_COMPANY_ID,
      createdAt: new Date().toISOString(),
    };
    setUnits(prev => [...prev, newUnit]);
  };

  const updateUnit = (id: string, unit: Partial<Unit>) => {
    setUnits(prev => prev.map(u => u.id === id ? { ...u, ...unit } : u));
  };

  const deleteUnit = (id: string) => {
    setUnits(prev => prev.filter(u => u.id !== id));
  };

  // ========================
  // TENANTS CRUD
  // ========================

  const addTenant = (tenant: Omit<Tenant, 'id' | 'companyId' | 'createdAt'>) => {
    const newTenant: Tenant = {
      ...tenant,
      id: `tenant-${Date.now()}`,
      companyId: DEMO_COMPANY_ID,
      createdAt: new Date().toISOString(),
    };
    setTenants(prev => [...prev, newTenant]);
  };

  const updateTenant = (id: string, tenant: Partial<Tenant>) => {
    setTenants(prev => prev.map(t => t.id === id ? { ...t, ...tenant } : t));
  };

  const deleteTenant = (id: string) => {
    setTenants(prev => prev.filter(t => t.id !== id));
  };

  // ========================
  // CONTRACTS CRUD (with auto payment generation)
  // ========================

  const addContract = (contract: Omit<Contract, 'id' | 'companyId' | 'createdAt'>) => {
    const contractId = `contract-${Date.now()}`;
    const newContract: Contract = {
      ...contract,
      id: contractId,
      companyId: DEMO_COMPANY_ID,
      createdAt: new Date().toISOString(),
    };
    setContracts(prev => [...prev, newContract]);

    // Auto-generate payment schedule
    const newPayments = generatePaymentSchedule(
      contractId,
      contract.tenantName,
      contract.unitNo,
      contract.startDate,
      contract.endDate,
      contract.rentAmount,
      contract.paymentFrequency
    );
    setPayments(prev => [...prev, ...newPayments]);

    // Update unit status to rented
    setUnits(prev => prev.map(u =>
      u.id === contract.unitId ? { ...u, status: 'rented' as UnitStatus } : u
    ));
  };

  const updateContract = (id: string, contract: Partial<Contract>) => {
    setContracts(prev => prev.map(c => c.id === id ? { ...c, ...contract } : c));

    // If contract ended, set unit to vacant
    if (contract.status === 'ended') {
      const existingContract = contracts.find(c => c.id === id);
      if (existingContract) {
        setUnits(prev => prev.map(u =>
          u.id === existingContract.unitId ? { ...u, status: 'vacant' as UnitStatus } : u
        ));
      }
    }
  };

  const deleteContract = (id: string) => {
    const contract = contracts.find(c => c.id === id);
    setContracts(prev => prev.filter(c => c.id !== id));
    setPayments(prev => prev.filter(p => p.contractId !== id));

    if (contract) {
      setUnits(prev => prev.map(u =>
        u.id === contract.unitId ? { ...u, status: 'vacant' as UnitStatus } : u
      ));
    }
  };

  // ========================
  // PAYMENTS
  // ========================

  const recordPayment = (paymentId: string, method: 'cash' | 'bank' | 'online', reference?: string) => {
    setPayments(prev => prev.map(p =>
      p.id === paymentId
        ? {
          ...p,
          status: 'paid' as PaymentStatus,
          paidAt: new Date().toISOString(),
          method,
          reference,
        }
        : p
    ));
  };

  // ========================
  // MAINTENANCE CRUD
  // ========================

  const addMaintenanceRequest = (request: Omit<MaintenanceRequest, 'id' | 'companyId' | 'createdAt'>) => {
    const newRequest: MaintenanceRequest = {
      ...request,
      id: `maint-${Date.now()}`,
      companyId: DEMO_COMPANY_ID,
      createdAt: new Date().toISOString(),
    };
    setMaintenanceRequests(prev => [...prev, newRequest]);
  };

  const updateMaintenanceRequest = (id: string, request: Partial<MaintenanceRequest>) => {
    setMaintenanceRequests(prev => prev.map(r => r.id === id ? { ...r, ...request } : r));
  };

  const deleteMaintenanceRequest = (id: string) => {
    setMaintenanceRequests(prev => prev.filter(r => r.id !== id));
  };

  // ========================
  // EMPLOYEES CRUD
  // ========================

  const addEmployee = (employee: Omit<Employee, 'id' | 'companyId' | 'createdAt'>) => {
    const newEmployee: Employee = {
      ...employee,
      id: `emp-${Date.now()}`,
      companyId: DEMO_COMPANY_ID,
      createdAt: new Date().toISOString(),
    };
    setEmployees(prev => [...prev, newEmployee]);
  };

  const updateEmployee = (id: string, employee: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...employee } : e));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  // ========================
  // TASKS CRUD
  // ========================

  const addTask = (task: Omit<Task, 'id' | 'companyId' | 'createdAt' | 'updatedAt' | 'history' | 'comments'>) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      companyId: DEMO_COMPANY_ID,
      comments: [],
      history: [{
        id: `h-${Date.now()}`,
        action: 'created',
        createdBy: task.createdBy,
        createdByName: task.createdByName,
        createdAt: now,
      }],
      createdAt: now,
      updatedAt: now,
    };
    setTasks(prev => [...prev, newTask]);
    // Add notification for assigned employee
    const notif: Notification = {
      id: `notif-${Date.now()}`,
      companyId: DEMO_COMPANY_ID,
      userId: task.assignedTo,
      type: 'task_assigned',
      title: 'مهمة جديدة',
      message: `تم تعيين مهمة "${task.title}" لك`,
      read: false,
      relatedId: newTask.id,
      createdAt: now,
    };
    setNotifications(prev => [...prev, notif]);
  };

  const updateTask = (id: string, task: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...task, updatedAt: new Date().toISOString() } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const transferTask = (taskId: string, toEmployeeId: string, toEmployeeName: string, note?: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const now = new Date().toISOString();
        const historyItem: TaskHistoryItem = {
          id: `h-${Date.now()}`,
          action: 'transferred',
          fromEmployee: t.assignedTo,
          fromEmployeeName: t.assignedToName,
          toEmployee: toEmployeeId,
          toEmployeeName: toEmployeeName,
          note,
          createdBy: t.assignedTo,
          createdByName: t.assignedToName,
          createdAt: now,
        };
        // Add notification
        const notif: Notification = {
          id: `notif-${Date.now()}`,
          companyId: DEMO_COMPANY_ID,
          userId: toEmployeeId,
          type: 'task_transferred',
          title: 'مهمة محولة',
          message: `تم تحويل مهمة "${t.title}" إليك من ${t.assignedToName}`,
          read: false,
          relatedId: taskId,
          createdAt: now,
        };
        setNotifications(p => [...p, notif]);
        return {
          ...t,
          assignedTo: toEmployeeId,
          assignedToName: toEmployeeName,
          history: [...t.history, historyItem],
          updatedAt: now,
        };
      }
      return t;
    }));
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const now = new Date().toISOString();
        const historyItem: TaskHistoryItem = {
          id: `h-${Date.now()}`,
          action: 'status_changed',
          fromStatus: t.status,
          toStatus: status,
          createdBy: t.assignedTo,
          createdByName: t.assignedToName,
          createdAt: now,
        };
        return {
          ...t,
          status,
          history: [...t.history, historyItem],
          updatedAt: now,
        };
      }
      return t;
    }));
  };

  // ========================
  // NOTIFICATIONS
  // ========================

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <DataContext.Provider
      value={{
        properties,
        units,
        tenants,
        contracts,
        payments,
        maintenanceRequests,
        employees,
        tasks,
        notifications,
        getKPI,
        addProperty,
        updateProperty,
        deleteProperty,
        addUnit,
        updateUnit,
        deleteUnit,
        addTenant,
        updateTenant,
        deleteTenant,
        addContract,
        updateContract,
        deleteContract,
        recordPayment,
        addMaintenanceRequest,
        updateMaintenanceRequest,
        deleteMaintenanceRequest,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addTask,
        updateTask,
        deleteTask,
        transferTask,
        updateTaskStatus,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
