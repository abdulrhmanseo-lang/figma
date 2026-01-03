import { useState } from 'react';
import { useData } from '../context/DataContext';

import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import {
    Plus, Search, Edit2, Trash2, Phone, Mail, Calendar,
    X, UserCircle, Building2, Copy, Check, Key, Eye, EyeOff
} from 'lucide-react';
import type { Employee, UserRole, EmployeePermission } from '../types/database';
import { toast } from 'sonner';

const roleLabels: Record<UserRole, string> = {
    admin: 'مدير النظام',
    manager: 'مدير',
    accountant: 'محاسب',
    maintenance: 'فني صيانة',
    employee: 'موظف',
};

const roleColors: Record<UserRole, string> = {
    admin: 'bg-purple-100 text-purple-700',
    manager: 'bg-blue-100 text-blue-700',
    accountant: 'bg-green-100 text-green-700',
    maintenance: 'bg-orange-100 text-orange-700',
    employee: 'bg-gray-100 text-gray-700',
};

export function Employees() {
    const { employees, addEmployee, updateEmployee, deleteEmployee } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

    // Credentials modal state
    const [showCredentials, setShowCredentials] = useState(false);
    const [newCredentials, setNewCredentials] = useState<{ email: string; password: string; name: string } | null>(null);
    const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(null);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        role: 'employee' as UserRole,
        department: '',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active' as 'active' | 'inactive' | 'on_leave',
    });

    // Generate email from name
    const generateEmail = (name: string): string => {
        const cleanName = name.trim().split(' ')[0].toLowerCase();
        const translitMap: Record<string, string> = {
            'أ': 'a', 'إ': 'e', 'آ': 'a', 'ا': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th',
            'ج': 'j', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'th', 'ر': 'r', 'ز': 'z',
            'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a',
            'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
            'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a', 'ة': 'a', 'ء': ''
        };
        let result = '';
        for (const char of cleanName) {
            result += translitMap[char] || char;
        }
        const randomNum = Math.floor(Math.random() * 100);
        return `${result}${randomNum}@arkan.sa`;
    };

    // Generate random password
    const generatePassword = (): string => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        const specials = '@#$%!';
        let password = '';
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        password += specials.charAt(Math.floor(Math.random() * specials.length));
        return password;
    };

    // Default permissions for new employee
    const getDefaultPermissions = (role: UserRole): EmployeePermission[] => {
        switch (role) {
            case 'admin':
                return [
                    { module: 'properties', actions: ['view', 'create', 'edit', 'delete'] },
                    { module: 'units', actions: ['view', 'create', 'edit', 'delete'] },
                    { module: 'tenants', actions: ['view', 'create', 'edit', 'delete'] },
                    { module: 'contracts', actions: ['view', 'create', 'edit', 'delete'] },
                    { module: 'payments', actions: ['view', 'create', 'edit', 'delete'] },
                    { module: 'maintenance', actions: ['view', 'create', 'edit', 'delete'] },
                    { module: 'reports', actions: ['view'] },
                    { module: 'employees', actions: ['view', 'create', 'edit', 'delete'] },
                ];
            case 'manager':
                return [
                    { module: 'properties', actions: ['view', 'create', 'edit'] },
                    { module: 'units', actions: ['view', 'create', 'edit'] },
                    { module: 'tenants', actions: ['view', 'create', 'edit'] },
                    { module: 'contracts', actions: ['view', 'create', 'edit'] },
                    { module: 'reports', actions: ['view'] },
                ];
            case 'accountant':
                return [
                    { module: 'payments', actions: ['view', 'create', 'edit', 'delete'] },
                    { module: 'contracts', actions: ['view'] },
                    { module: 'reports', actions: ['view'] },
                    { module: 'sales', actions: ['view', 'create', 'edit', 'delete'] },
                ];
            case 'maintenance':
                return [
                    { module: 'maintenance', actions: ['view', 'create', 'edit'] },
                    { module: 'units', actions: ['view'] },
                    { module: 'tasks', actions: ['view', 'edit'] },
                ];
            default:
                return [
                    { module: 'properties', actions: ['view'] },
                    { module: 'units', actions: ['view'] },
                    { module: 'tenants', actions: ['view'] },
                ];
        }
    };

    // Copy to clipboard
    const copyToClipboard = async (text: string, field: 'email' | 'password') => {
        await navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
        toast.success('تم النسخ!');
    };

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.fullName.includes(searchQuery) ||
            emp.email.includes(searchQuery) ||
            emp.phone.includes(searchQuery);
        const matchesRole = roleFilter === 'all' || emp.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleOpenModal = (employee?: Employee) => {
        if (employee) {
            setEditingEmployee(employee);
            setFormData({
                fullName: employee.fullName,
                email: employee.email,
                phone: employee.phone,
                role: employee.role,
                department: employee.department,
                joinDate: employee.joinDate,
                status: employee.status,
            });
        } else {
            setEditingEmployee(null);
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                role: 'employee',
                department: '',
                joinDate: new Date().toISOString().split('T')[0],
                status: 'active',
            });
        }
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingEmployee) {
            updateEmployee(editingEmployee.id, formData);
            toast.success('تم تحديث بيانات الموظف');
        } else {
            // Generate credentials for new employee
            const email = formData.email || generateEmail(formData.fullName);
            const password = generatePassword();
            const permissions = getDefaultPermissions(formData.role);

            addEmployee({
                ...formData,
                email,
                password,
                permissions,
                isActive: true,
            });

            // Show credentials modal
            setNewCredentials({ email, password, name: formData.fullName });
            setShowCredentials(true);
        }
        setShowModal(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
            deleteEmployee(id);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <p className="text-gray-500">{employees.length} موظف مسجل</p>
                </div>
                <Button onClick={() => handleOpenModal()} className="bg-brand-blue hover:bg-brand-dark text-white">
                    <Plus className="w-5 h-5 ml-2" />
                    إضافة موظف
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="بحث عن موظف..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                    >
                        <option value="all">جميع الأدوار</option>
                        {Object.entries(roleLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Employees Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEmployees.map((emp, index) => (
                    <motion.div
                        key={emp.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-brand-blue to-brand-purple rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {emp.fullName.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-brand-dark">{emp.fullName}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[emp.role]}`}>
                                        {roleLabels[emp.role]}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handleOpenModal(emp)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <Edit2 className="w-4 h-4 text-gray-500" />
                                </button>
                                <button
                                    onClick={() => handleDelete(emp.id)}
                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Building2 className="w-4 h-4" />
                                <span>{emp.department}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="w-4 h-4" />
                                <span>{emp.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="w-4 h-4" />
                                <span dir="ltr">{emp.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>تاريخ الانضمام: {new Date(emp.joinDate).toLocaleDateString('ar-EG')}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <span className={`text-xs px-3 py-1 rounded-full ${emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {emp.status === 'active' ? 'نشط' : 'غير نشط'}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredEmployees.length === 0 && (
                <div className="text-center py-12">
                    <UserCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">لا يوجد موظفين</p>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-brand-dark">
                                    {editingEmployee ? 'تعديل موظف' : 'إضافة موظف جديد'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            required
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">الدور</label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                                        >
                                            {Object.entries(roleLabels).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">القسم</label>
                                        <input
                                            type="text"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            required
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانضمام</label>
                                        <input
                                            type="date"
                                            value={formData.joinDate}
                                            onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                                            required
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                                        >
                                            <option value="active">نشط</option>
                                            <option value="inactive">غير نشط</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button type="submit" className="flex-1 bg-brand-blue hover:bg-brand-dark text-white">
                                        {editingEmployee ? 'حفظ التعديلات' : 'إضافة الموظف'}
                                    </Button>
                                    <Button type="button" onClick={() => setShowModal(false)} variant="outline" className="flex-1">
                                        إلغاء
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Credentials Modal */}
            <AnimatePresence>
                {showCredentials && newCredentials && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
                        >
                            <div className="p-6 border-b border-gray-100 text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-8 h-8 text-green-600" />
                                </div>
                                <h2 className="text-xl font-bold text-brand-dark">تم إضافة الموظف بنجاح!</h2>
                                <p className="text-gray-500 text-sm mt-1">{newCredentials.name}</p>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <p className="text-sm text-blue-700 font-medium mb-3">
                                        <Key className="w-4 h-4 inline ml-1" />
                                        بيانات الدخول للموظف:
                                    </p>

                                    {/* Email */}
                                    <div className="flex items-center justify-between bg-white rounded-lg p-3 mb-2">
                                        <div>
                                            <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                                            <p className="font-mono text-sm" dir="ltr">{newCredentials.email}</p>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(newCredentials.email, 'email')}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            {copiedField === 'email' ? (
                                                <Check className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Copy className="w-4 h-4 text-gray-500" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Password */}
                                    <div className="flex items-center justify-between bg-white rounded-lg p-3">
                                        <div>
                                            <p className="text-xs text-gray-500">كلمة المرور</p>
                                            <div className="flex items-center gap-2">
                                                <p className="font-mono text-sm" dir="ltr">
                                                    {showNewPassword ? newCredentials.password : '••••••••'}
                                                </p>
                                                <button
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="p-1 hover:bg-gray-100 rounded"
                                                >
                                                    {showNewPassword ? (
                                                        <EyeOff className="w-4 h-4 text-gray-400" />
                                                    ) : (
                                                        <Eye className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(newCredentials.password, 'password')}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            {copiedField === 'password' ? (
                                                <Check className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Copy className="w-4 h-4 text-gray-500" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-400 text-center">
                                    قم بإرسال هذه البيانات للموظف ليتمكن من الدخول من بوابة الموظفين
                                </p>
                            </div>

                            <div className="p-6 border-t border-gray-100">
                                <Button
                                    onClick={() => {
                                        setShowCredentials(false);
                                        setNewCredentials(null);
                                        setShowNewPassword(false);
                                    }}
                                    className="w-full bg-brand-blue hover:bg-brand-dark text-white"
                                >
                                    تم
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

    );
}
