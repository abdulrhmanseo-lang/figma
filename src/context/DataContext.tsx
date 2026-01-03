import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabase';
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
  loading: boolean;

  // KPI
  getKPI: () => DashboardKPI;

  // Refresh data
  refreshData: () => Promise<void>;

  // Properties CRUD
  addProperty: (property: Omit<Property, 'id' | 'companyId' | 'createdAt'>) => Promise<void>;
  updateProperty: (id: string, property: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;

  // Units CRUD
  addUnit: (unit: Omit<Unit, 'id' | 'companyId' | 'createdAt'>) => Promise<void>;
  updateUnit: (id: string, unit: Partial<Unit>) => Promise<void>;
  deleteUnit: (id: string) => Promise<void>;

  // Tenants CRUD
  addTenant: (tenant: Omit<Tenant, 'id' | 'companyId' | 'createdAt'>) => Promise<void>;
  updateTenant: (id: string, tenant: Partial<Tenant>) => Promise<void>;
  deleteTenant: (id: string) => Promise<void>;

  // Contracts CRUD (auto-generates payments)
  addContract: (contract: Omit<Contract, 'id' | 'companyId' | 'createdAt'>) => Promise<void>;
  updateContract: (id: string, contract: Partial<Contract>) => Promise<void>;
  deleteContract: (id: string) => Promise<void>;

  // Payments
  recordPayment: (paymentId: string, method: 'cash' | 'bank' | 'online', reference?: string) => Promise<void>;

  // Maintenance CRUD
  addMaintenanceRequest: (request: Omit<MaintenanceRequest, 'id' | 'companyId' | 'createdAt'>) => Promise<void>;
  updateMaintenanceRequest: (id: string, request: Partial<MaintenanceRequest>) => Promise<void>;
  deleteMaintenanceRequest: (id: string) => Promise<void>;

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

const DEMO_COMPANY_ID = 'demo-company';

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
): Omit<Payment, 'id' | 'companyId' | 'createdAt'>[] {
  const payments: Omit<Payment, 'id' | 'companyId' | 'createdAt'>[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();

  let monthIncrement = 1;
  if (frequency === 'quarterly') monthIncrement = 3;
  if (frequency === 'yearly') monthIncrement = 12;

  let current = new Date(start);

  while (current <= end) {
    const dueDate = current.toISOString().split('T')[0];
    const isPast = new Date(dueDate) < today;

    payments.push({
      contractId,
      tenantName,
      unitNo,
      dueDate,
      amount: rentAmount,
      status: isPast ? 'overdue' : 'due',
    });

    current.setMonth(current.getMonth() + monthIncrement);
  }

  return payments;
}

// Convert snake_case to camelCase for property names
function mapPropertyFromDB(row: any): Property {
  return {
    id: row.id,
    companyId: row.company_id,
    name: row.name,
    city: row.city,
    address: row.address,
    type: row.type,
    description: row.description,
    latitude: row.latitude,
    longitude: row.longitude,
    notes: row.notes,
    images: row.images || [],
    createdAt: row.created_at,
  };
}

function mapUnitFromDB(row: any): Unit {
  return {
    id: row.id,
    companyId: row.company_id,
    propertyId: row.property_id,
    propertyName: row.property_name,
    unitNo: row.unit_no,
    type: row.type,
    floor: row.floor,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    areaSqm: row.area_sqm,
    description: row.description,
    rentAmount: row.rent_amount,
    status: row.status,
    images: row.images || [],
    createdAt: row.created_at,
  };
}

function mapTenantFromDB(row: any): Tenant {
  return {
    id: row.id,
    companyId: row.company_id,
    fullName: row.full_name,
    nationalId: row.national_id,
    phone: row.phone,
    email: row.email,
    createdAt: row.created_at,
  };
}

function mapContractFromDB(row: any): Contract {
  return {
    id: row.id,
    companyId: row.company_id,
    propertyId: row.property_id,
    propertyName: row.property_name,
    unitId: row.unit_id,
    unitNo: row.unit_no,
    tenantId: row.tenant_id,
    tenantName: row.tenant_name,
    startDate: row.start_date,
    endDate: row.end_date,
    rentAmount: row.rent_amount,
    paymentFrequency: row.payment_frequency,
    depositAmount: row.deposit_amount,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapPaymentFromDB(row: any): Payment {
  return {
    id: row.id,
    companyId: row.company_id,
    contractId: row.contract_id,
    tenantName: row.tenant_name,
    unitNo: row.unit_no,
    dueDate: row.due_date,
    amount: row.amount,
    status: row.status,
    paidAt: row.paid_at,
    method: row.method,
    reference: row.reference,
    createdAt: row.created_at,
  };
}

function mapMaintenanceFromDB(row: any): MaintenanceRequest {
  return {
    id: row.id,
    companyId: row.company_id,
    propertyId: row.property_id,
    propertyName: row.property_name,
    unitId: row.unit_id,
    unitNo: row.unit_no,
    title: row.title,
    description: row.description,
    priority: row.priority,
    status: row.status,
    cost: row.cost,
    requestedBy: row.requested_by,
    assignedTo: row.assigned_to,
    createdAt: row.created_at,
  };
}

// ========================
// INITIAL EMPLOYEES (Local for now)
// ========================

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
];

const initialTasks: Task[] = [];
const initialNotifications: Notification[] = [];

// ========================
// DATA PROVIDER
// ========================

export function DataProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [loading, setLoading] = useState(true);

  // ========================
  // FETCH DATA FROM SUPABASE
  // ========================

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch properties
      const { data: propertiesData } = await supabase.from('properties').select('*').eq('company_id', DEMO_COMPANY_ID);
      if (propertiesData) setProperties(propertiesData.map(mapPropertyFromDB));

      // Fetch units
      const { data: unitsData } = await supabase.from('units').select('*').eq('company_id', DEMO_COMPANY_ID);
      if (unitsData) setUnits(unitsData.map(mapUnitFromDB));

      // Fetch tenants
      const { data: tenantsData } = await supabase.from('tenants').select('*').eq('company_id', DEMO_COMPANY_ID);
      if (tenantsData) setTenants(tenantsData.map(mapTenantFromDB));

      // Fetch contracts
      const { data: contractsData } = await supabase.from('contracts').select('*').eq('company_id', DEMO_COMPANY_ID);
      if (contractsData) setContracts(contractsData.map(mapContractFromDB));

      // Fetch payments
      const { data: paymentsData } = await supabase.from('payments').select('*').eq('company_id', DEMO_COMPANY_ID);
      if (paymentsData) setPayments(paymentsData.map(mapPaymentFromDB));

      // Fetch maintenance requests
      const { data: maintenanceData } = await supabase.from('maintenance_requests').select('*').eq('company_id', DEMO_COMPANY_ID);
      if (maintenanceData) setMaintenanceRequests(maintenanceData.map(mapMaintenanceFromDB));

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

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

  const addProperty = async (property: Omit<Property, 'id' | 'companyId' | 'createdAt'>) => {
    const { error } = await supabase.from('properties').insert({
      company_id: DEMO_COMPANY_ID,
      name: property.name,
      city: property.city,
      address: property.address,
      type: property.type,
      description: property.description,
      notes: property.notes,
      images: property.images,
    });
    if (!error) await refreshData();
  };

  const updateProperty = async (id: string, property: Partial<Property>) => {
    const updateData: any = {};
    if (property.name) updateData.name = property.name;
    if (property.city) updateData.city = property.city;
    if (property.address) updateData.address = property.address;
    if (property.type) updateData.type = property.type;
    if (property.description !== undefined) updateData.description = property.description;
    if (property.notes !== undefined) updateData.notes = property.notes;
    if (property.images) updateData.images = property.images;

    const { error } = await supabase.from('properties').update(updateData).eq('id', id);
    if (!error) await refreshData();
  };

  const deleteProperty = async (id: string) => {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (!error) await refreshData();
  };

  // ========================
  // UNITS CRUD
  // ========================

  const addUnit = async (unit: Omit<Unit, 'id' | 'companyId' | 'createdAt'>) => {
    const { error } = await supabase.from('units').insert({
      company_id: DEMO_COMPANY_ID,
      property_id: unit.propertyId,
      property_name: unit.propertyName,
      unit_no: unit.unitNo,
      type: unit.type,
      floor: unit.floor,
      bedrooms: unit.bedrooms,
      bathrooms: unit.bathrooms,
      area_sqm: unit.areaSqm,
      description: unit.description,
      rent_amount: unit.rentAmount,
      status: unit.status || 'vacant',
      images: unit.images,
    });
    if (!error) await refreshData();
  };

  const updateUnit = async (id: string, unit: Partial<Unit>) => {
    const updateData: any = {};
    if (unit.propertyId) updateData.property_id = unit.propertyId;
    if (unit.propertyName) updateData.property_name = unit.propertyName;
    if (unit.unitNo) updateData.unit_no = unit.unitNo;
    if (unit.type) updateData.type = unit.type;
    if (unit.floor !== undefined) updateData.floor = unit.floor;
    if (unit.bedrooms !== undefined) updateData.bedrooms = unit.bedrooms;
    if (unit.bathrooms !== undefined) updateData.bathrooms = unit.bathrooms;
    if (unit.areaSqm !== undefined) updateData.area_sqm = unit.areaSqm;
    if (unit.description !== undefined) updateData.description = unit.description;
    if (unit.rentAmount !== undefined) updateData.rent_amount = unit.rentAmount;
    if (unit.status) updateData.status = unit.status;
    if (unit.images) updateData.images = unit.images;

    const { error } = await supabase.from('units').update(updateData).eq('id', id);
    if (!error) await refreshData();
  };

  const deleteUnit = async (id: string) => {
    const { error } = await supabase.from('units').delete().eq('id', id);
    if (!error) await refreshData();
  };

  // ========================
  // TENANTS CRUD
  // ========================

  const addTenant = async (tenant: Omit<Tenant, 'id' | 'companyId' | 'createdAt'>) => {
    const { error } = await supabase.from('tenants').insert({
      company_id: DEMO_COMPANY_ID,
      full_name: tenant.fullName,
      national_id: tenant.nationalId,
      phone: tenant.phone,
      email: tenant.email,
    });
    if (!error) await refreshData();
  };

  const updateTenant = async (id: string, tenant: Partial<Tenant>) => {
    const updateData: any = {};
    if (tenant.fullName) updateData.full_name = tenant.fullName;
    if (tenant.nationalId !== undefined) updateData.national_id = tenant.nationalId;
    if (tenant.phone) updateData.phone = tenant.phone;
    if (tenant.email !== undefined) updateData.email = tenant.email;

    const { error } = await supabase.from('tenants').update(updateData).eq('id', id);
    if (!error) await refreshData();
  };

  const deleteTenant = async (id: string) => {
    const { error } = await supabase.from('tenants').delete().eq('id', id);
    if (!error) await refreshData();
  };

  // ========================
  // CONTRACTS CRUD
  // ========================

  const addContract = async (contract: Omit<Contract, 'id' | 'companyId' | 'createdAt'>) => {
    // Insert contract
    const { data, error } = await supabase.from('contracts').insert({
      company_id: DEMO_COMPANY_ID,
      property_id: contract.propertyId,
      property_name: contract.propertyName,
      unit_id: contract.unitId,
      unit_no: contract.unitNo,
      tenant_id: contract.tenantId,
      tenant_name: contract.tenantName,
      start_date: contract.startDate,
      end_date: contract.endDate,
      rent_amount: contract.rentAmount,
      payment_frequency: contract.paymentFrequency,
      deposit_amount: contract.depositAmount,
      notes: contract.notes,
      status: contract.status || 'active',
    }).select().single();

    if (!error && data) {
      // Generate and insert payments
      const newPayments = generatePaymentSchedule(
        data.id,
        contract.tenantName,
        contract.unitNo,
        contract.startDate,
        contract.endDate,
        contract.rentAmount,
        contract.paymentFrequency
      );

      for (const payment of newPayments) {
        await supabase.from('payments').insert({
          company_id: DEMO_COMPANY_ID,
          contract_id: payment.contractId,
          tenant_name: payment.tenantName,
          unit_no: payment.unitNo,
          due_date: payment.dueDate,
          amount: payment.amount,
          status: payment.status,
        });
      }

      // Update unit status to rented
      await supabase.from('units').update({ status: 'rented' }).eq('id', contract.unitId);

      await refreshData();
    }
  };

  const updateContract = async (id: string, contract: Partial<Contract>) => {
    const updateData: any = {};
    if (contract.status) updateData.status = contract.status;
    if (contract.notes !== undefined) updateData.notes = contract.notes;
    if (contract.rentAmount !== undefined) updateData.rent_amount = contract.rentAmount;

    const { error } = await supabase.from('contracts').update(updateData).eq('id', id);

    if (!error && contract.status === 'ended') {
      const existingContract = contracts.find(c => c.id === id);
      if (existingContract) {
        await supabase.from('units').update({ status: 'vacant' }).eq('id', existingContract.unitId);
      }
    }

    if (!error) await refreshData();
  };

  const deleteContract = async (id: string) => {
    const contract = contracts.find(c => c.id === id);

    // Delete associated payments first
    await supabase.from('payments').delete().eq('contract_id', id);

    const { error } = await supabase.from('contracts').delete().eq('id', id);

    if (!error && contract) {
      await supabase.from('units').update({ status: 'vacant' }).eq('id', contract.unitId);
      await refreshData();
    }
  };

  // ========================
  // PAYMENTS
  // ========================

  const recordPayment = async (paymentId: string, method: 'cash' | 'bank' | 'online', reference?: string) => {
    const { error } = await supabase.from('payments').update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      method,
      reference: reference || null,
    }).eq('id', paymentId);

    if (!error) await refreshData();
  };

  // ========================
  // MAINTENANCE CRUD
  // ========================

  const addMaintenanceRequest = async (request: Omit<MaintenanceRequest, 'id' | 'companyId' | 'createdAt'>) => {
    const { error } = await supabase.from('maintenance_requests').insert({
      company_id: DEMO_COMPANY_ID,
      property_id: request.propertyId,
      property_name: request.propertyName,
      unit_id: request.unitId,
      unit_no: request.unitNo,
      title: request.title,
      description: request.description,
      priority: request.priority,
      status: request.status || 'new',
      cost: request.cost || 0,
      requested_by: request.requestedBy,
      assigned_to: request.assignedTo,
    });
    if (!error) await refreshData();
  };

  const updateMaintenanceRequest = async (id: string, request: Partial<MaintenanceRequest>) => {
    const updateData: any = {};
    if (request.title) updateData.title = request.title;
    if (request.description) updateData.description = request.description;
    if (request.priority) updateData.priority = request.priority;
    if (request.status) updateData.status = request.status;
    if (request.cost !== undefined) updateData.cost = request.cost;
    if (request.assignedTo !== undefined) updateData.assigned_to = request.assignedTo;

    const { error } = await supabase.from('maintenance_requests').update(updateData).eq('id', id);
    if (!error) await refreshData();
  };

  const deleteMaintenanceRequest = async (id: string) => {
    const { error } = await supabase.from('maintenance_requests').delete().eq('id', id);
    if (!error) await refreshData();
  };

  // ========================
  // EMPLOYEES CRUD (Local for now)
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
  // TASKS CRUD (Local for now)
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
  };

  const updateTask = (id: string, task: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...task, updatedAt: new Date().toISOString() } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const transferTask = (taskId: string, toEmployeeId: string, toEmployeeName: string, note?: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const now = new Date().toISOString();
        return {
          ...task,
          assignedTo: toEmployeeId,
          assignedToName: toEmployeeName,
          history: [...task.history, {
            id: `h-${Date.now()}`,
            action: 'transferred' as const,
            fromEmployee: task.assignedTo,
            fromEmployeeName: task.assignedToName,
            toEmployee: toEmployeeId,
            toEmployeeName,
            note,
            createdBy: task.assignedTo,
            createdByName: task.assignedToName,
            createdAt: now,
          }],
          updatedAt: now,
        };
      }
      return task;
    }));
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const now = new Date().toISOString();
        return {
          ...task,
          status,
          history: [...task.history, {
            id: `h-${Date.now()}`,
            action: 'status_changed' as const,
            fromStatus: task.status,
            toStatus: status,
            createdBy: task.assignedTo,
            createdByName: task.assignedToName,
            createdAt: now,
          }],
          updatedAt: now,
        };
      }
      return task;
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
        loading,
        getKPI,
        refreshData,
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
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
