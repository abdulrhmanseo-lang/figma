import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Building2, Lock, Mail, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';

export function EmployeeLoginPage() {
    const navigate = useNavigate();
    const { employees } = useData();
    const { setEmployeeSession } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Find employee by email (case insensitive and trimmed)
        const employee = employees.find(emp =>
            emp.email.toLowerCase().trim() === email.toLowerCase().trim()
        );

        console.log('Login Attempt:', {
            email: email.trim(),
            found: !!employee,
            status: employee?.status,
            isActive: employee?.isActive
        });

        if (!employee) {
            setError('البريد الإلكتروني غير مسجل');
            setLoading(false);
            return;
        }

        if (!employee.isActive) {
            setError('حسابك غير نشط. تواصل مع الإدارة');
            setLoading(false);
            return;
        }

        // Check password (trimmed)
        if (employee.password !== password.trim()) {
            console.log('Password Mismatch:', {
                inputLength: password.trim().length,
                storedLength: employee.password.length
            });
            setError('كلمة المرور غير صحيحة');
            setLoading(false);
            return;
        }

        // Successful login
        if (setEmployeeSession) {
            setEmployeeSession(employee);
        }

        // Store in localStorage for persistence
        localStorage.setItem('employeeSession', JSON.stringify(employee));

        setLoading(false);
        navigate('/employee/dashboard');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-dark to-slate-900 flex items-center justify-center p-4" dir="rtl">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -left-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-3 group">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-purple p-3 shadow-lg group-hover:shadow-brand-blue/30 transition-shadow">
                            <Building2 className="w-full h-full text-white" />
                        </div>
                        <span className="text-3xl font-bold text-white">أركان</span>
                    </Link>
                    <p className="mt-4 text-gray-400">بوابة الموظفين</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    <h2 className="text-2xl font-bold text-brand-dark text-center mb-6">
                        تسجيل الدخول
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                            >
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                البريد الإلكتروني
                            </label>
                            <div className="relative">
                                <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pr-12 pl-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                                    placeholder="name@arkan.sa"
                                    required
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                كلمة المرور
                            </label>
                            <div className="relative">
                                <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pr-12 pl-12 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                                    placeholder="••••••••"
                                    required
                                    dir="ltr"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="gradient"
                            className="w-full py-4 text-lg"
                            disabled={loading}
                        >
                            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                        </Button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                        <p className="text-sm text-blue-700 font-medium mb-2">بيانات تجريبية:</p>
                        <div className="space-y-1 text-xs text-blue-600">
                            <p><strong>محاسب:</strong> khaled@arkan.sa / Khaled@2024</p>
                            <p><strong>صيانة:</strong> mohammed@arkan.sa / Mohammed@2024</p>
                            <p><strong>خدمة عملاء:</strong> fatima@arkan.sa / Fatima@2024</p>
                        </div>
                    </div>

                    {/* Back to Admin */}
                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="text-sm text-gray-500 hover:text-brand-blue transition-colors"
                        >
                            ← الدخول كمسؤول
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
