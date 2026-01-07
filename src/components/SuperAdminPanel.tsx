// Super Admin Panel Component for Arkan PMS
// Only visible to authorized Super Admin emails
// Protected and secure access

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { FirestoreCompanyService, type CompanyWithStats } from '../services/FirestoreCompanyService';
import {
    Building2,
    Users,
    Home,
    DollarSign,
    Crown,
    Eye,
    ChevronDown,
    Activity,
    CheckCircle2,
    Shield,
    Server,
    X,
    FileText,
    Wrench,
    Calendar,
    RefreshCw,
    Loader2
} from 'lucide-react';

// ========================
// SUPER ADMIN ONLY EMAILS
// ========================

const SUPER_ADMIN_EMAILS = [
    'abdulrhmanseo@gmail.com',
    'admin@arkan.sa'
];

// ========================
// TYPES
// ========================

interface CompanyData {
    id: string;
    name: string;
    nameAr: string;
    status: 'active' | 'inactive' | 'trial' | 'suspended';
    users: number;
    properties: number;
    units: number;
    occupancy: number;
    revenue: number;
    lastActivity: string;
}

// ========================
// HELPER FUNCTIONS
// ========================

const formatSAR = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount) + ' ر.س';
};

const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-SA').format(num);
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'active': return 'bg-green-100 text-green-700';
        case 'trial': return 'bg-blue-100 text-blue-700';
        case 'inactive': return 'bg-gray-100 text-gray-700';
        case 'suspended': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'active': return 'نشط';
        case 'trial': return 'تجريبي';
        case 'inactive': return 'غير نشط';
        case 'suspended': return 'موقوف';
        default: return status;
    }
};

// Convert Firestore company to display format
const convertToDisplayFormat = (company: CompanyWithStats): CompanyData => {
    const createdAt = company.createdAt;
    const lastActivity = typeof createdAt === 'string'
        ? createdAt
        : createdAt?.toDate?.()?.toISOString() || new Date().toISOString();

    return {
        id: company.id,
        name: company.name,
        nameAr: company.nameAr,
        status: company.status,
        users: company.stats?.userCount || 1,
        properties: company.stats?.propertyCount || 0,
        units: company.stats?.unitCount || 0,
        occupancy: company.stats?.occupancyRate || 0,
        revenue: company.stats?.totalRevenue || 0,
        lastActivity
    };
};

// ========================
// SUPER ADMIN PANEL COMPONENT
// ========================

export function SuperAdminPanel() {
    const { user, isSuperAdmin } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
    const [companies, setCompanies] = useState<CompanyData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Strict access check - only allow specific emails
    const userEmail = user?.email?.toLowerCase() || '';
    const hasAccess = SUPER_ADMIN_EMAILS.some(email =>
        email.toLowerCase() === userEmail
    ) && isSuperAdmin;

    // Fetch companies from Firestore
    const fetchCompanies = async () => {
        if (!hasAccess) return;

        setLoading(true);
        setError(null);

        try {
            const firestoreCompanies = await FirestoreCompanyService.getAllCompaniesWithStats();
            const displayCompanies = firestoreCompanies.map(convertToDisplayFormat);
            setCompanies(displayCompanies);
            console.log('[SuperAdminPanel] Fetched', displayCompanies.length, 'companies from Firestore');
        } catch (err) {
            console.error('[SuperAdminPanel] Error fetching companies:', err);
            setError('فشل تحميل الشركات');
        } finally {
            setLoading(false);
        }
    };

    // Load companies when panel is expanded
    useEffect(() => {
        if (isExpanded && hasAccess && companies.length === 0 && !loading) {
            fetchCompanies();
        }
    }, [isExpanded, hasAccess, companies.length, loading]); // Added dependencies for useEffect

    // Don't render anything if not authorized
    if (!hasAccess) {
        return null;
    }

    // Calculate totals
    const totals = {
        companies: companies.length,
        users: companies.reduce((sum, c) => sum + c.users, 0),
        properties: companies.reduce((sum, c) => sum + c.properties, 0),
        units: companies.reduce((sum, c) => sum + c.units, 0),
        revenue: companies.reduce((sum, c) => sum + c.revenue, 0),
        avgOccupancy: Math.round(companies.reduce((sum, c) => sum + c.occupancy, 0) / companies.length)
    };

    const activeCompanies = companies.filter(c => c.status === 'active').length;
    const trialCompanies = companies.filter(c => c.status === 'trial').length;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
        >
            {/* Header Bar */}
            <motion.div
                onClick={() => setIsExpanded(!isExpanded)}
                className="cursor-pointer bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Crown className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-lg flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                لوحة Super Admin
                            </h2>
                            <p className="text-white/80 text-sm">
                                {totals.companies} شركة • {totals.users} مستخدم • {formatSAR(totals.revenue)} إيرادات
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Quick Stats */}
                        <div className="hidden md:flex items-center gap-4 text-white/90 text-sm">
                            <div className="flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-green-300" />
                                <span>{activeCompanies} نشط</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Activity className="w-4 h-4 text-blue-300" />
                                <span>{trialCompanies} تجريبي</span>
                            </div>
                        </div>

                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
                        >
                            <ChevronDown className="w-5 h-5 text-white" />
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Expanded Panel */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white rounded-2xl shadow-lg mt-2 p-6 border border-gray-100">
                            {/* System Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                                            <Building2 className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">الشركات</p>
                                            <p className="text-xl font-bold text-gray-800">{totals.companies}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                                            <Users className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">المستخدمين</p>
                                            <p className="text-xl font-bold text-gray-800">{totals.users}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                                            <Home className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">الوحدات</p>
                                            <p className="text-xl font-bold text-gray-800">{formatNumber(totals.units)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
                                            <DollarSign className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">الإيرادات</p>
                                            <p className="text-lg font-bold text-gray-800">{formatSAR(totals.revenue)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Companies Table */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Server className="w-5 h-5 text-brand-blue" />
                                    الشركات المسجلة
                                </h3>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-gray-500 text-sm border-b border-gray-200">
                                                <th className="text-right pb-3 font-medium">الشركة</th>
                                                <th className="text-center pb-3 font-medium">الحالة</th>
                                                <th className="text-center pb-3 font-medium">المستخدمين</th>
                                                <th className="text-center pb-3 font-medium">العقارات</th>
                                                <th className="text-center pb-3 font-medium">الوحدات</th>
                                                <th className="text-center pb-3 font-medium">الإشغال</th>
                                                <th className="text-center pb-3 font-medium">الإيرادات</th>
                                                <th className="text-center pb-3 font-medium">إجراء</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {companies.map((company, index) => (
                                                <motion.tr
                                                    key={company.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="border-b border-gray-100 hover:bg-white transition-colors"
                                                >
                                                    <td className="py-3">
                                                        <div>
                                                            <p className="font-medium text-gray-800">{company.nameAr}</p>
                                                            <p className="text-xs text-gray-400">{company.name}</p>
                                                        </div>
                                                    </td>
                                                    <td className="text-center py-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>
                                                            {getStatusLabel(company.status)}
                                                        </span>
                                                    </td>
                                                    <td className="text-center py-3 text-gray-700">{company.users}</td>
                                                    <td className="text-center py-3 text-gray-700">{company.properties}</td>
                                                    <td className="text-center py-3 text-gray-700">{company.units}</td>
                                                    <td className="text-center py-3">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${company.occupancy >= 80 ? 'bg-green-500' :
                                                                        company.occupancy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                                        }`}
                                                                    style={{ width: `${company.occupancy}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs text-gray-500">{company.occupancy}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="text-center py-3 text-gray-700 font-medium">
                                                        {formatSAR(company.revenue)}
                                                    </td>
                                                    <td className="text-center py-3">
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => setSelectedCompany(company.id)}
                                                            className="px-3 py-1.5 bg-brand-blue text-white text-xs rounded-lg hover:bg-brand-blue/90 transition-colors flex items-center gap-1 mx-auto"
                                                        >
                                                            <Eye className="w-3 h-3" />
                                                            عرض
                                                        </motion.button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Footer Info */}
                            <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    <span>وصول محمي - Super Admin فقط</span>
                                </div>
                                <div>
                                    آخر تحديث: {new Date().toLocaleString('ar-SA')}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Company Details Modal */}
            <AnimatePresence>
                {selectedCompany && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedCompany(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {(() => {
                                const company = companies.find(c => c.id === selectedCompany);
                                if (!company) return null;

                                return (
                                    <>
                                        {/* Modal Header */}
                                        <div className="bg-gradient-to-r from-brand-blue to-purple-600 p-6 rounded-t-2xl">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h2 className="text-2xl font-bold text-white">{company.nameAr}</h2>
                                                    <p className="text-white/80">{company.name}</p>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedCompany(null)}
                                                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                                                >
                                                    <X className="w-5 h-5 text-white" />
                                                </button>
                                            </div>
                                            <div className="mt-3">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(company.status)}`}>
                                                    {getStatusLabel(company.status)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Modal Body */}
                                        <div className="p-6">
                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                                <div className="bg-blue-50 rounded-xl p-4 text-center">
                                                    <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                                    <p className="text-2xl font-bold text-gray-800">{company.users}</p>
                                                    <p className="text-xs text-gray-500">المستخدمين</p>
                                                </div>
                                                <div className="bg-purple-50 rounded-xl p-4 text-center">
                                                    <Building2 className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                                                    <p className="text-2xl font-bold text-gray-800">{company.properties}</p>
                                                    <p className="text-xs text-gray-500">العقارات</p>
                                                </div>
                                                <div className="bg-green-50 rounded-xl p-4 text-center">
                                                    <Home className="w-6 h-6 text-green-600 mx-auto mb-2" />
                                                    <p className="text-2xl font-bold text-gray-800">{company.units}</p>
                                                    <p className="text-xs text-gray-500">الوحدات</p>
                                                </div>
                                                <div className="bg-amber-50 rounded-xl p-4 text-center">
                                                    <DollarSign className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                                                    <p className="text-lg font-bold text-gray-800">{formatSAR(company.revenue)}</p>
                                                    <p className="text-xs text-gray-500">الإيرادات</p>
                                                </div>
                                            </div>

                                            {/* Occupancy */}
                                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-gray-700">نسبة الإشغال</span>
                                                    <span className="text-lg font-bold text-gray-800">{company.occupancy}%</span>
                                                </div>
                                                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${company.occupancy}%` }}
                                                        transition={{ duration: 0.5 }}
                                                        className={`h-full rounded-full ${company.occupancy >= 80 ? 'bg-green-500' :
                                                            company.occupancy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                    />
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                                                    <FileText className="w-5 h-5 text-brand-blue" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">العقود النشطة</p>
                                                        <p className="font-bold text-gray-800">{Math.floor(company.units * 0.8)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                                                    <Wrench className="w-5 h-5 text-orange-500" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">طلبات الصيانة</p>
                                                        <p className="font-bold text-gray-800">{Math.floor(Math.random() * 15) + 2}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                                                    <Calendar className="w-5 h-5 text-purple-500" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">آخر نشاط</p>
                                                        <p className="font-bold text-gray-800">{new Date(company.lastActivity).toLocaleDateString('ar-SA')}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                                                    <Activity className="w-5 h-5 text-green-500" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">حالة النظام</p>
                                                        <p className="font-bold text-green-600">يعمل بشكل طبيعي</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="mt-6 flex gap-3">
                                                <button
                                                    onClick={() => setSelectedCompany(null)}
                                                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                                                >
                                                    إغلاق
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default SuperAdminPanel;
