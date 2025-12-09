import { createContext, useContext, useState, ReactNode } from 'react';

// Types
export interface Property {
  id: string;
  name: string;
  city: string;
  address: string;
  description: string;
  units: number;
  occupancyRate: number;
  images: string[];
}

export interface Unit {
  id: string;
  propertyId: string;
  propertyName: string;
  unitNumber: string;
  type: string;
  price: number;
  status: 'available' | 'rented';
  images: string[];
  area: number;
  bedrooms: number;
  bathrooms: number;
}

export interface Contract {
  id: string;
  tenantName: string;
  tenantPhone: string;
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitNumber: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  status: 'active' | 'expired' | 'pending';
  pdfUrl?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  tenantName: string;
  amount: number;
  tax: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  paidDate?: string;
}

export interface MaintenanceTicket {
  id: string;
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitNumber: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  createdDate: string;
  images: string[];
}

interface DataContextType {
  properties: Property[];
  units: Unit[];
  contracts: Contract[];
  invoices: Invoice[];
  maintenanceTickets: MaintenanceTicket[];
  addProperty: (property: Omit<Property, 'id'>) => void;
  updateProperty: (id: string, property: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  addUnit: (unit: Omit<Unit, 'id'>) => void;
  updateUnit: (id: string, unit: Partial<Unit>) => void;
  deleteUnit: (id: string) => void;
  addContract: (contract: Omit<Contract, 'id'>) => void;
  updateContract: (id: string, contract: Partial<Contract>) => void;
  deleteContract: (id: string) => void;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  addMaintenanceTicket: (ticket: Omit<MaintenanceTicket, 'id'>) => void;
  updateMaintenanceTicket: (id: string, ticket: Partial<MaintenanceTicket>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock initial data
const initialProperties: Property[] = [
  {
    id: '1',
    name: 'برج الياسمين',
    city: 'الرياض',
    address: 'حي النرجس، شارع التخصصي',
    description: 'برج سكني فاخر يحتوي على 50 وحدة سكنية بمواصفات عالية',
    units: 50,
    occupancyRate: 92,
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
  },
  {
    id: '2',
    name: 'مجمع الورود السكني',
    city: 'جدة',
    address: 'حي الزهراء، طريق الملك عبدالعزيز',
    description: 'مجمع سكني متكامل بخدمات ومرافق متنوعة',
    units: 80,
    occupancyRate: 85,
    images: ['https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800'],
  },
  {
    id: '3',
    name: 'فلل الربيع',
    city: 'الدمام',
    address: 'حي الفيصلية',
    description: 'فلل سكنية راقية بتصاميم عصرية',
    units: 24,
    occupancyRate: 95,
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
  },
];

const initialUnits: Unit[] = [
  {
    id: '1',
    propertyId: '1',
    propertyName: 'برج الياسمين',
    unitNumber: 'A-101',
    type: 'شقة 3 غرف',
    price: 45000,
    status: 'rented',
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
    area: 180,
    bedrooms: 3,
    bathrooms: 2,
  },
  {
    id: '2',
    propertyId: '1',
    propertyName: 'برج الياسمين',
    unitNumber: 'A-102',
    type: 'شقة 2 غرفتين',
    price: 35000,
    status: 'available',
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
    area: 120,
    bedrooms: 2,
    bathrooms: 1,
  },
  {
    id: '3',
    propertyId: '2',
    propertyName: 'مجمع الورود السكني',
    unitNumber: 'B-201',
    type: 'شقة 4 غرف',
    price: 55000,
    status: 'rented',
    images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'],
    area: 220,
    bedrooms: 4,
    bathrooms: 3,
  },
];

const initialContracts: Contract[] = [
  {
    id: '1',
    tenantName: 'محمد أحمد السعيد',
    tenantPhone: '0501234567',
    propertyId: '1',
    propertyName: 'برج الياسمين',
    unitId: '1',
    unitNumber: 'A-101',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    monthlyRent: 45000,
    status: 'active',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: '2',
    tenantName: 'فاطمة علي الزهراني',
    tenantPhone: '0557654321',
    propertyId: '3',
    propertyName: 'فلل الربيع',
    unitId: '3',
    unitNumber: 'B-201',
    startDate: '2024-03-01',
    endDate: '2025-02-28',
    monthlyRent: 55000,
    status: 'active',
  },
];

const initialInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    tenantName: 'محمد أحمد السعيد',
    amount: 45000,
    tax: 6750,
    total: 51750,
    status: 'paid',
    dueDate: '2024-12-01',
    paidDate: '2024-11-28',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    tenantName: 'فاطمة علي الزهراني',
    amount: 55000,
    tax: 8250,
    total: 63250,
    status: 'pending',
    dueDate: '2024-12-05',
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    tenantName: 'عبدالله خالد',
    amount: 35000,
    tax: 5250,
    total: 40250,
    status: 'overdue',
    dueDate: '2024-11-20',
  },
];

const initialMaintenanceTickets: MaintenanceTicket[] = [
  {
    id: '1',
    propertyId: '1',
    propertyName: 'برج الياسمين',
    unitId: '1',
    unitNumber: 'A-101',
    title: 'تسريب في الحمام',
    description: 'يوجد تسريب مياه في حمام الغرفة الرئيسية',
    status: 'in-progress',
    priority: 'high',
    assignedTo: 'أحمد السباك',
    createdDate: '2024-12-05',
    images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400'],
  },
  {
    id: '2',
    propertyId: '2',
    propertyName: 'مجمع الورود السكني',
    unitId: '3',
    unitNumber: 'B-201',
    title: 'عطل في المكيف',
    description: 'المكيف لا يعمل بشكل صحيح',
    status: 'pending',
    priority: 'medium',
    createdDate: '2024-12-07',
    images: [],
  },
  {
    id: '3',
    propertyId: '1',
    propertyName: 'برج الياسمين',
    unitId: '2',
    unitNumber: 'A-102',
    title: 'صيانة دورية',
    description: 'فحص عام للوحدة',
    status: 'completed',
    priority: 'low',
    assignedTo: 'فريق الصيانة',
    createdDate: '2024-12-01',
    images: [],
  },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>(initialMaintenanceTickets);

  // Properties CRUD
  const addProperty = (property: Omit<Property, 'id'>) => {
    const newProperty = { ...property, id: Date.now().toString() };
    setProperties([...properties, newProperty]);
  };

  const updateProperty = (id: string, property: Partial<Property>) => {
    setProperties(properties.map(p => p.id === id ? { ...p, ...property } : p));
  };

  const deleteProperty = (id: string) => {
    setProperties(properties.filter(p => p.id !== id));
  };

  // Units CRUD
  const addUnit = (unit: Omit<Unit, 'id'>) => {
    const newUnit = { ...unit, id: Date.now().toString() };
    setUnits([...units, newUnit]);
  };

  const updateUnit = (id: string, unit: Partial<Unit>) => {
    setUnits(units.map(u => u.id === id ? { ...u, ...unit } : u));
  };

  const deleteUnit = (id: string) => {
    setUnits(units.filter(u => u.id !== id));
  };

  // Contracts CRUD
  const addContract = (contract: Omit<Contract, 'id'>) => {
    const newContract = { ...contract, id: Date.now().toString() };
    setContracts([...contracts, newContract]);
  };

  const updateContract = (id: string, contract: Partial<Contract>) => {
    setContracts(contracts.map(c => c.id === id ? { ...c, ...contract } : c));
  };

  const deleteContract = (id: string) => {
    setContracts(contracts.filter(c => c.id !== id));
  };

  // Invoices CRUD
  const addInvoice = (invoice: Omit<Invoice, 'id'>) => {
    const newInvoice = { ...invoice, id: Date.now().toString() };
    setInvoices([...invoices, newInvoice]);
  };

  const updateInvoice = (id: string, invoice: Partial<Invoice>) => {
    setInvoices(invoices.map(i => i.id === id ? { ...i, ...invoice } : i));
  };

  // Maintenance CRUD
  const addMaintenanceTicket = (ticket: Omit<MaintenanceTicket, 'id'>) => {
    const newTicket = { ...ticket, id: Date.now().toString() };
    setMaintenanceTickets([...maintenanceTickets, newTicket]);
  };

  const updateMaintenanceTicket = (id: string, ticket: Partial<MaintenanceTicket>) => {
    setMaintenanceTickets(maintenanceTickets.map(t => t.id === id ? { ...t, ...ticket } : t));
  };

  return (
    <DataContext.Provider
      value={{
        properties,
        units,
        contracts,
        invoices,
        maintenanceTickets,
        addProperty,
        updateProperty,
        deleteProperty,
        addUnit,
        updateUnit,
        deleteUnit,
        addContract,
        updateContract,
        deleteContract,
        addInvoice,
        updateInvoice,
        addMaintenanceTicket,
        updateMaintenanceTicket,
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
