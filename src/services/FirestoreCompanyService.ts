// Firestore Company Service for Arkan PMS
// Real company data management with Firestore
// Super Admin sees actual registered companies

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ========================
// TYPES
// ========================

export interface FirestoreCompany {
    id: string;
    name: string;
    nameAr: string;
    email: string;
    phone?: string;
    ownerId: string; // Firebase UID of owner
    ownerName: string;
    status: 'active' | 'inactive' | 'trial' | 'suspended';
    subscriptionPlan: string;
    createdAt: Timestamp | string;
    updatedAt: Timestamp | string;
}

export interface CompanyStats {
    companyId: string;
    userCount: number;
    propertyCount: number;
    unitCount: number;
    contractCount: number;
    paymentCount: number;
    maintenanceCount: number;
    totalRevenue: number;
    occupancyRate: number;
}

export interface CompanyWithStats extends FirestoreCompany {
    stats: CompanyStats;
}

// ========================
// COLLECTION NAMES
// ========================

const COLLECTIONS = {
    COMPANIES: 'companies',
    COMPANY_STATS: 'companyStats',
    USERS: 'users',
    PROPERTIES: 'properties',
    UNITS: 'units',
    CONTRACTS: 'contracts',
    PAYMENTS: 'payments',
    MAINTENANCE: 'maintenance'
};

// ========================
// COMPANY CRUD
// ========================

export async function createCompany(
    ownerId: string,
    ownerEmail: string,
    ownerName: string,
    companyName?: string
): Promise<FirestoreCompany> {
    const companyId = `company-${ownerId}`;

    const company: FirestoreCompany = {
        id: companyId,
        name: companyName || `${ownerName}'s Company`,
        nameAr: companyName || `شركة ${ownerName}`,
        email: ownerEmail,
        ownerId,
        ownerName,
        status: 'trial',
        subscriptionPlan: 'trial',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    };

    await setDoc(doc(db, COLLECTIONS.COMPANIES, companyId), company);

    // Initialize empty stats
    const stats: CompanyStats = {
        companyId,
        userCount: 1,
        propertyCount: 0,
        unitCount: 0,
        contractCount: 0,
        paymentCount: 0,
        maintenanceCount: 0,
        totalRevenue: 0,
        occupancyRate: 0
    };

    await setDoc(doc(db, COLLECTIONS.COMPANY_STATS, companyId), stats);

    // Update user doc with company reference
    await updateDoc(doc(db, COLLECTIONS.USERS, ownerId), {
        companyId,
        role: 'company_admin',
        updatedAt: Timestamp.now()
    }).catch(() => {
        // User doc might not exist yet, create it
        setDoc(doc(db, COLLECTIONS.USERS, ownerId), {
            companyId,
            role: 'company_admin',
            email: ownerEmail,
            name: ownerName,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        }, { merge: true });
    });

    console.log('[FirestoreCompanyService] Company created:', companyId);
    return company;
}

export async function getCompany(companyId: string): Promise<FirestoreCompany | null> {
    const docRef = doc(db, COLLECTIONS.COMPANIES, companyId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as FirestoreCompany;
    }
    return null;
}

export async function getCompanyByOwner(ownerId: string): Promise<FirestoreCompany | null> {
    const companyId = `company-${ownerId}`;
    return getCompany(companyId);
}

export async function updateCompany(
    companyId: string,
    updates: Partial<FirestoreCompany>
): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.COMPANIES, companyId), {
        ...updates,
        updatedAt: Timestamp.now()
    });
}

// ========================
// GET ALL COMPANIES (SUPER ADMIN)
// ========================

export async function getAllCompanies(): Promise<FirestoreCompany[]> {
    const companiesRef = collection(db, COLLECTIONS.COMPANIES);
    const q = query(companiesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as FirestoreCompany));
}

export async function getCompanyStats(companyId: string): Promise<CompanyStats | null> {
    const docRef = doc(db, COLLECTIONS.COMPANY_STATS, companyId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as CompanyStats;
    }
    return null;
}

export async function getAllCompaniesWithStats(): Promise<CompanyWithStats[]> {
    const companies = await getAllCompanies();

    const companiesWithStats: CompanyWithStats[] = [];

    for (const company of companies) {
        let stats = await getCompanyStats(company.id);

        if (!stats) {
            // Calculate stats if not cached
            stats = await calculateCompanyStats(company.id);
        }

        companiesWithStats.push({
            ...company,
            stats
        });
    }

    return companiesWithStats;
}

// ========================
// CALCULATE STATS
// ========================

export async function calculateCompanyStats(companyId: string): Promise<CompanyStats> {
    // Get counts from each collection filtered by companyId
    let propertyCount = 0;
    let unitCount = 0;
    let contractCount = 0;
    let paymentCount = 0;
    let maintenanceCount = 0;
    let totalRevenue = 0;
    let occupiedUnits = 0;

    try {
        // Properties
        const propsQuery = query(
            collection(db, COLLECTIONS.PROPERTIES),
            where('companyId', '==', companyId)
        );
        const propsSnap = await getDocs(propsQuery);
        propertyCount = propsSnap.size;

        // Units
        const unitsQuery = query(
            collection(db, COLLECTIONS.UNITS),
            where('companyId', '==', companyId)
        );
        const unitsSnap = await getDocs(unitsQuery);
        unitCount = unitsSnap.size;

        unitsSnap.docs.forEach(doc => {
            const data = doc.data();
            if (data.status === 'occupied') occupiedUnits++;
        });

        // Contracts
        const contractsQuery = query(
            collection(db, COLLECTIONS.CONTRACTS),
            where('companyId', '==', companyId)
        );
        const contractsSnap = await getDocs(contractsQuery);
        contractCount = contractsSnap.size;

        // Payments
        const paymentsQuery = query(
            collection(db, COLLECTIONS.PAYMENTS),
            where('companyId', '==', companyId)
        );
        const paymentsSnap = await getDocs(paymentsQuery);
        paymentCount = paymentsSnap.size;

        paymentsSnap.docs.forEach(doc => {
            const data = doc.data();
            if (data.status === 'paid') {
                totalRevenue += data.amount || 0;
            }
        });

        // Maintenance
        const maintQuery = query(
            collection(db, COLLECTIONS.MAINTENANCE),
            where('companyId', '==', companyId)
        );
        const maintSnap = await getDocs(maintQuery);
        maintenanceCount = maintSnap.size;

    } catch (error) {
        console.error('[FirestoreCompanyService] Error calculating stats:', error);
    }

    const occupancyRate = unitCount > 0 ? Math.round((occupiedUnits / unitCount) * 100) : 0;

    const stats: CompanyStats = {
        companyId,
        userCount: 1,
        propertyCount,
        unitCount,
        contractCount,
        paymentCount,
        maintenanceCount,
        totalRevenue,
        occupancyRate
    };

    // Cache the stats
    await setDoc(doc(db, COLLECTIONS.COMPANY_STATS, companyId), stats).catch(console.error);

    return stats;
}

// ========================
// SYSTEM STATS (SUPER ADMIN)
// ========================

export interface SystemStats {
    totalCompanies: number;
    activeCompanies: number;
    trialCompanies: number;
    suspendedCompanies: number;
    totalUsers: number;
    totalProperties: number;
    totalUnits: number;
    totalRevenue: number;
}

export async function getSystemStats(): Promise<SystemStats> {
    const companies = await getAllCompaniesWithStats();

    let activeCompanies = 0;
    let trialCompanies = 0;
    let suspendedCompanies = 0;
    let totalUsers = 0;
    let totalProperties = 0;
    let totalUnits = 0;
    let totalRevenue = 0;

    companies.forEach(company => {
        if (company.status === 'active') activeCompanies++;
        if (company.status === 'trial') trialCompanies++;
        if (company.status === 'suspended') suspendedCompanies++;

        totalUsers += company.stats.userCount;
        totalProperties += company.stats.propertyCount;
        totalUnits += company.stats.unitCount;
        totalRevenue += company.stats.totalRevenue;
    });

    return {
        totalCompanies: companies.length,
        activeCompanies,
        trialCompanies,
        suspendedCompanies,
        totalUsers,
        totalProperties,
        totalUnits,
        totalRevenue
    };
}

// ========================
// EXPORT
// ========================

export const FirestoreCompanyService = {
    // CRUD
    createCompany,
    getCompany,
    getCompanyByOwner,
    updateCompany,

    // Super Admin
    getAllCompanies,
    getAllCompaniesWithStats,
    getCompanyStats,
    calculateCompanyStats,
    getSystemStats
};

export default FirestoreCompanyService;
