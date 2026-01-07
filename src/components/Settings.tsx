import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Bell,
  Lock,
  Database,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Palette,
  Moon,
  Sun,
  Monitor,
  Globe,
  Shield,
  Key,
  Smartphone,
  Mail,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

// ========================
// TRANSLATIONS
// ========================

const translations = {
  ar: {
    title: 'الإعدادات',
    subtitle: 'إدارة حسابك وتفضيلات التطبيق',
    saveChanges: 'حفظ التغييرات',
    saved: 'تم الحفظ بنجاح',
    sections: {
      profile: 'الملف الشخصي',
      notifications: 'الإشعارات',
      privacy: 'الخصوصية والأمان',
      data: 'إدارة البيانات',
      appearance: 'المظهر'
    },
    profile: {
      fullName: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      company: 'الشركة',
      role: 'الدور الوظيفي',
      phone: 'رقم الهاتف',
      changePassword: 'تغيير كلمة المرور',
      currentPassword: 'كلمة المرور الحالية',
      newPassword: 'كلمة المرور الجديدة',
      confirmPassword: 'تأكيد كلمة المرور',
      roles: {
        admin: 'مدير النظام',
        manager: 'مدير',
        accountant: 'محاسب',
        employee: 'موظف'
      }
    },
    notifications: {
      emailAlerts: 'تنبيهات البريد الإلكتروني',
      emailAlertsDesc: 'استلام إشعارات عبر البريد الإلكتروني',
      pushNotifications: 'الإشعارات الفورية',
      pushNotificationsDesc: 'تلقي إشعارات في المتصفح',
      smsAlerts: 'رسائل SMS',
      smsAlertsDesc: 'استلام رسائل نصية للتنبيهات الهامة',
      paymentReminders: 'تذكيرات الدفع',
      paymentRemindersDesc: 'تنبيه عند اقتراب موعد الدفع',
      contractExpiry: 'انتهاء العقود',
      contractExpiryDesc: 'تنبيه قبل انتهاء العقود',
      maintenanceUpdates: 'تحديثات الصيانة',
      maintenanceUpdatesDesc: 'إشعار عند تحديث طلبات الصيانة'
    },
    privacy: {
      twoFactorAuth: 'المصادقة الثنائية',
      twoFactorAuthDesc: 'تأمين إضافي لحسابك',
      loginAlerts: 'تنبيهات تسجيل الدخول',
      loginAlertsDesc: 'إشعار عند تسجيل دخول جديد',
      dataEncryption: 'تشفير البيانات',
      dataEncryptionDesc: 'تشفير جميع بياناتك',
      sessionTimeout: 'انتهاء الجلسة',
      sessionTimeoutDesc: 'تسجيل الخروج التلقائي بعد',
      minutes: 'دقيقة',
      activityLog: 'سجل النشاط',
      activityLogDesc: 'تتبع جميع الأنشطة في حسابك',
      enabled: 'مفعل',
      disabled: 'معطل'
    },
    data: {
      exportData: 'تصدير البيانات',
      exportDataDesc: 'تحميل جميع بياناتك بصيغة JSON',
      importData: 'استيراد البيانات',
      importDataDesc: 'استيراد بيانات من ملف سابق',
      resetSettings: 'إعادة ضبط الإعدادات',
      resetSettingsDesc: 'إرجاع جميع الإعدادات للافتراضي',
      deleteData: 'حذف جميع البيانات',
      deleteDataDesc: 'حذف نهائي لجميع بياناتك',
      warning: 'تحذير: هذا الإجراء لا يمكن التراجع عنه'
    },
    appearance: {
      theme: 'المظهر',
      themeDesc: 'اختر مظهر التطبيق',
      light: 'فاتح',
      dark: 'داكن',
      auto: 'تلقائي',
      language: 'اللغة',
      languageDesc: 'اختر لغة التطبيق',
      arabic: 'العربية',
      english: 'English',
      dateFormat: 'تنسيق التاريخ',
      dateFormatDesc: 'اختر طريقة عرض التاريخ',
      fontSize: 'حجم الخط',
      fontSizeDesc: 'تعديل حجم الخط',
      small: 'صغير',
      medium: 'متوسط',
      large: 'كبير'
    }
  },
  en: {
    title: 'Settings',
    subtitle: 'Manage your account and app preferences',
    saveChanges: 'Save Changes',
    saved: 'Saved successfully',
    sections: {
      profile: 'Profile',
      notifications: 'Notifications',
      privacy: 'Privacy & Security',
      data: 'Data Management',
      appearance: 'Appearance'
    },
    profile: {
      fullName: 'Full Name',
      email: 'Email Address',
      company: 'Company',
      role: 'Role',
      phone: 'Phone Number',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      roles: {
        admin: 'Administrator',
        manager: 'Manager',
        accountant: 'Accountant',
        employee: 'Employee'
      }
    },
    notifications: {
      emailAlerts: 'Email Alerts',
      emailAlertsDesc: 'Receive notifications via email',
      pushNotifications: 'Push Notifications',
      pushNotificationsDesc: 'Get browser notifications',
      smsAlerts: 'SMS Alerts',
      smsAlertsDesc: 'Receive text messages for important alerts',
      paymentReminders: 'Payment Reminders',
      paymentRemindersDesc: 'Alert when payment is due',
      contractExpiry: 'Contract Expiry',
      contractExpiryDesc: 'Alert before contracts expire',
      maintenanceUpdates: 'Maintenance Updates',
      maintenanceUpdatesDesc: 'Notify on maintenance status changes'
    },
    privacy: {
      twoFactorAuth: 'Two-Factor Authentication',
      twoFactorAuthDesc: 'Extra security for your account',
      loginAlerts: 'Login Alerts',
      loginAlertsDesc: 'Notify on new login',
      dataEncryption: 'Data Encryption',
      dataEncryptionDesc: 'Encrypt all your data',
      sessionTimeout: 'Session Timeout',
      sessionTimeoutDesc: 'Auto logout after',
      minutes: 'minutes',
      activityLog: 'Activity Log',
      activityLogDesc: 'Track all account activities',
      enabled: 'Enabled',
      disabled: 'Disabled'
    },
    data: {
      exportData: 'Export Data',
      exportDataDesc: 'Download all your data as JSON',
      importData: 'Import Data',
      importDataDesc: 'Import data from backup file',
      resetSettings: 'Reset Settings',
      resetSettingsDesc: 'Reset all settings to default',
      deleteData: 'Delete All Data',
      deleteDataDesc: 'Permanently delete all your data',
      warning: 'Warning: This action cannot be undone'
    },
    appearance: {
      theme: 'Theme',
      themeDesc: 'Choose app appearance',
      light: 'Light',
      dark: 'Dark',
      auto: 'Auto',
      language: 'Language',
      languageDesc: 'Choose app language',
      arabic: 'العربية',
      english: 'English',
      dateFormat: 'Date Format',
      dateFormatDesc: 'Choose date display format',
      fontSize: 'Font Size',
      fontSizeDesc: 'Adjust text size',
      small: 'Small',
      medium: 'Medium',
      large: 'Large'
    }
  }
};

export function Settings() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    profile: {
      name: user?.displayName || 'Demo User',
      email: user?.email || 'demo@arkan.sa',
      company: 'شركة أركان',
      role: 'admin',
      phone: '+966 50 000 0000'
    },
    notifications: {
      emailAlerts: true,
      pushNotifications: true,
      smsAlerts: false,
      paymentReminders: true,
      contractExpiry: true,
      maintenanceUpdates: true
    },
    privacy: {
      twoFactorAuth: false,
      loginAlerts: true,
      dataEncryption: true,
      sessionTimeout: 30,
      activityLog: true
    },
    appearance: {
      theme: 'light' as 'light' | 'dark' | 'auto',
      language: 'ar' as 'ar' | 'en',
      dateFormat: 'DD/MM/YYYY',
      fontSize: 'medium' as 'small' | 'medium' | 'large'
    }
  });

  const t = translations[settings.appearance.language];
  const isRTL = settings.appearance.language === 'ar';

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (settings.appearance.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.appearance.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // Auto - check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.appearance.theme]);

  const sections = [
    { id: 'profile', label: t.sections.profile, icon: User },
    { id: 'notifications', label: t.sections.notifications, icon: Bell },
    { id: 'privacy', label: t.sections.privacy, icon: Lock },
    { id: 'data', label: t.sections.data, icon: Database },
    { id: 'appearance', label: t.sections.appearance, icon: Palette }
  ];

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev as any)[section],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success(t.saved);
  };

  // Toggle Switch Component
  const ToggleSwitch = ({ checked, onChange, disabled = false }: { checked: boolean; onChange: (val: boolean) => void; disabled?: boolean }) => (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative w-14 h-7 rounded-full transition-all duration-300 ${checked
          ? 'bg-gradient-to-r from-brand-blue to-purple-500'
          : 'bg-gray-300 dark:bg-gray-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <motion.div
        initial={false}
        animate={{ x: checked ? (isRTL ? 2 : 28) : (isRTL ? 28 : 2) }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
      />
    </motion.button>
  );

  // Setting Card Component
  const SettingCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl p-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );

  // Setting Row Component
  const SettingRow = ({
    icon: Icon,
    title,
    description,
    children,
    iconColor = 'text-brand-blue'
  }: {
    icon: any;
    title: string;
    description: string;
    children: React.ReactNode;
    iconColor?: string;
  }) => (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center ${iconColor} flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold text-gray-800 dark:text-white text-sm lg:text-base">{title}</h4>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 truncate">{description}</p>
        </div>
      </div>
      <div className="flex-shrink-0">
        {children}
      </div>
    </div>
  );

  // Profile Settings
  const renderProfileSettings = () => (
    <div className="space-y-6">
      {/* Avatar Section */}
      <SettingCard>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-blue to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {settings.profile.name.charAt(0)}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 border-4 border-white dark:border-gray-800 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{settings.profile.name}</h3>
            <p className="text-gray-500 dark:text-gray-400">{settings.profile.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-brand-blue/10 text-brand-blue text-xs rounded-full font-medium">
              {(t.profile.roles as any)[settings.profile.role]}
            </span>
          </div>
        </div>
      </SettingCard>

      {/* Form Fields */}
      <SettingCard>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.profile.fullName}
            </label>
            <input
              type="text"
              value={settings.profile.name}
              onChange={(e) => updateSetting('profile', 'name', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.profile.email}
            </label>
            <input
              type="email"
              value={settings.profile.email}
              onChange={(e) => updateSetting('profile', 'email', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.profile.company}
            </label>
            <input
              type="text"
              value={settings.profile.company}
              onChange={(e) => updateSetting('profile', 'company', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.profile.phone}
            </label>
            <input
              type="tel"
              value={settings.profile.phone}
              onChange={(e) => updateSetting('profile', 'phone', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all"
              dir="ltr"
            />
          </div>
        </div>
      </SettingCard>

      {/* Password Change */}
      <SettingCard>
        <h4 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-brand-blue" />
          {t.profile.changePassword}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={t.profile.currentPassword}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              placeholder={t.profile.newPassword}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
            />
            <button
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <input
            type="password"
            placeholder={t.profile.confirmPassword}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
          />
        </div>
      </SettingCard>
    </div>
  );

  // Notification Settings
  const renderNotificationSettings = () => (
    <div className="space-y-4">
      <SettingCard>
        <SettingRow
          icon={Mail}
          title={t.notifications.emailAlerts}
          description={t.notifications.emailAlertsDesc}
          iconColor="text-blue-500"
        >
          <ToggleSwitch
            checked={settings.notifications.emailAlerts}
            onChange={(val) => updateSetting('notifications', 'emailAlerts', val)}
          />
        </SettingRow>
        <SettingRow
          icon={Bell}
          title={t.notifications.pushNotifications}
          description={t.notifications.pushNotificationsDesc}
          iconColor="text-purple-500"
        >
          <ToggleSwitch
            checked={settings.notifications.pushNotifications}
            onChange={(val) => updateSetting('notifications', 'pushNotifications', val)}
          />
        </SettingRow>
        <SettingRow
          icon={Smartphone}
          title={t.notifications.smsAlerts}
          description={t.notifications.smsAlertsDesc}
          iconColor="text-green-500"
        >
          <ToggleSwitch
            checked={settings.notifications.smsAlerts}
            onChange={(val) => updateSetting('notifications', 'smsAlerts', val)}
          />
        </SettingRow>
      </SettingCard>

      <SettingCard>
        <SettingRow
          icon={Bell}
          title={t.notifications.paymentReminders}
          description={t.notifications.paymentRemindersDesc}
          iconColor="text-amber-500"
        >
          <ToggleSwitch
            checked={settings.notifications.paymentReminders}
            onChange={(val) => updateSetting('notifications', 'paymentReminders', val)}
          />
        </SettingRow>
        <SettingRow
          icon={Bell}
          title={t.notifications.contractExpiry}
          description={t.notifications.contractExpiryDesc}
          iconColor="text-red-500"
        >
          <ToggleSwitch
            checked={settings.notifications.contractExpiry}
            onChange={(val) => updateSetting('notifications', 'contractExpiry', val)}
          />
        </SettingRow>
        <SettingRow
          icon={Bell}
          title={t.notifications.maintenanceUpdates}
          description={t.notifications.maintenanceUpdatesDesc}
          iconColor="text-teal-500"
        >
          <ToggleSwitch
            checked={settings.notifications.maintenanceUpdates}
            onChange={(val) => updateSetting('notifications', 'maintenanceUpdates', val)}
          />
        </SettingRow>
      </SettingCard>
    </div>
  );

  // Privacy Settings
  const renderPrivacySettings = () => (
    <div className="space-y-4">
      <SettingCard>
        <SettingRow
          icon={Shield}
          title={t.privacy.twoFactorAuth}
          description={t.privacy.twoFactorAuthDesc}
          iconColor="text-green-500"
        >
          <ToggleSwitch
            checked={settings.privacy.twoFactorAuth}
            onChange={(val) => updateSetting('privacy', 'twoFactorAuth', val)}
          />
        </SettingRow>
        <SettingRow
          icon={Bell}
          title={t.privacy.loginAlerts}
          description={t.privacy.loginAlertsDesc}
          iconColor="text-blue-500"
        >
          <ToggleSwitch
            checked={settings.privacy.loginAlerts}
            onChange={(val) => updateSetting('privacy', 'loginAlerts', val)}
          />
        </SettingRow>
        <SettingRow
          icon={Lock}
          title={t.privacy.dataEncryption}
          description={t.privacy.dataEncryptionDesc}
          iconColor="text-purple-500"
        >
          <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm rounded-full font-medium">
            {t.privacy.enabled}
          </div>
        </SettingRow>
      </SettingCard>

      <SettingCard>
        <SettingRow
          icon={RefreshCw}
          title={t.privacy.sessionTimeout}
          description={t.privacy.sessionTimeoutDesc}
          iconColor="text-orange-500"
        >
          <select
            value={settings.privacy.sessionTimeout}
            onChange={(e) => updateSetting('privacy', 'sessionTimeout', Number(e.target.value))}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 text-sm"
          >
            <option value={15}>15 {t.privacy.minutes}</option>
            <option value={30}>30 {t.privacy.minutes}</option>
            <option value={60}>60 {t.privacy.minutes}</option>
            <option value={120}>120 {t.privacy.minutes}</option>
          </select>
        </SettingRow>
        <SettingRow
          icon={Database}
          title={t.privacy.activityLog}
          description={t.privacy.activityLogDesc}
          iconColor="text-indigo-500"
        >
          <ToggleSwitch
            checked={settings.privacy.activityLog}
            onChange={(val) => updateSetting('privacy', 'activityLog', val)}
          />
        </SettingRow>
      </SettingCard>
    </div>
  );

  // Data Management
  const renderDataManagement = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 text-right hover:shadow-lg transition-all"
      >
        <Download className="w-10 h-10 text-blue-500 mb-4" />
        <h4 className="font-bold text-gray-800 dark:text-white mb-1">{t.data.exportData}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.data.exportDataDesc}</p>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800 text-right hover:shadow-lg transition-all"
      >
        <Upload className="w-10 h-10 text-green-500 mb-4" />
        <h4 className="font-bold text-gray-800 dark:text-white mb-1">{t.data.importData}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.data.importDataDesc}</p>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-100 dark:border-amber-800 text-right hover:shadow-lg transition-all"
      >
        <RefreshCw className="w-10 h-10 text-amber-500 mb-4" />
        <h4 className="font-bold text-gray-800 dark:text-white mb-1">{t.data.resetSettings}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.data.resetSettingsDesc}</p>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 text-right hover:shadow-lg transition-all"
      >
        <Trash2 className="w-10 h-10 text-red-500 mb-4" />
        <h4 className="font-bold text-red-600 dark:text-red-400 mb-1">{t.data.deleteData}</h4>
        <p className="text-sm text-red-500 dark:text-red-400">{t.data.deleteDataDesc}</p>
        <div className="flex items-center gap-2 mt-3 text-xs text-red-400">
          <AlertTriangle className="w-4 h-4" />
          {t.data.warning}
        </div>
      </motion.button>
    </div>
  );

  // Appearance Settings
  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      {/* Theme Selection */}
      <SettingCard>
        <h4 className="font-semibold text-gray-800 dark:text-white mb-2">{t.appearance.theme}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t.appearance.themeDesc}</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'light', label: t.appearance.light, icon: Sun },
            { value: 'dark', label: t.appearance.dark, icon: Moon },
            { value: 'auto', label: t.appearance.auto, icon: Monitor }
          ].map(({ value, label, icon: Icon }) => (
            <motion.button
              key={value}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => updateSetting('appearance', 'theme', value)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${settings.appearance.theme === value
                  ? 'border-brand-blue bg-brand-blue/10 dark:bg-brand-blue/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-brand-blue/50'
                }`}
            >
              <Icon className={`w-6 h-6 mx-auto mb-2 ${settings.appearance.theme === value ? 'text-brand-blue' : 'text-gray-400'
                }`} />
              <span className={`text-sm font-medium ${settings.appearance.theme === value ? 'text-brand-blue' : 'text-gray-600 dark:text-gray-300'
                }`}>
                {label}
              </span>
            </motion.button>
          ))}
        </div>
      </SettingCard>

      {/* Language Selection */}
      <SettingCard>
        <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
          <Globe className="w-5 h-5 text-brand-blue" />
          {t.appearance.language}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t.appearance.languageDesc}</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'ar', label: 'العربية', flag: '🇸🇦' },
            { value: 'en', label: 'English', flag: '🇬🇧' }
          ].map(({ value, label, flag }) => (
            <motion.button
              key={value}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => updateSetting('appearance', 'language', value)}
              className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-3 ${settings.appearance.language === value
                  ? 'border-brand-blue bg-brand-blue/10 dark:bg-brand-blue/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-brand-blue/50'
                }`}
            >
              <span className="text-2xl">{flag}</span>
              <span className={`font-medium ${settings.appearance.language === value ? 'text-brand-blue' : 'text-gray-600 dark:text-gray-300'
                }`}>
                {label}
              </span>
            </motion.button>
          ))}
        </div>
      </SettingCard>

      {/* Date Format */}
      <SettingCard>
        <h4 className="font-semibold text-gray-800 dark:text-white mb-2">{t.appearance.dateFormat}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t.appearance.dateFormatDesc}</p>
        <select
          value={settings.appearance.dateFormat}
          onChange={(e) => updateSetting('appearance', 'dateFormat', e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
        >
          <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
          <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
        </select>
      </SettingCard>

      {/* Font Size */}
      <SettingCard>
        <h4 className="font-semibold text-gray-800 dark:text-white mb-2">{t.appearance.fontSize}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t.appearance.fontSizeDesc}</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'small', label: t.appearance.small },
            { value: 'medium', label: t.appearance.medium },
            { value: 'large', label: t.appearance.large }
          ].map(({ value, label }) => (
            <motion.button
              key={value}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => updateSetting('appearance', 'fontSize', value)}
              className={`p-3 rounded-xl border-2 transition-all duration-300 ${settings.appearance.fontSize === value
                  ? 'border-brand-blue bg-brand-blue/10 dark:bg-brand-blue/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-brand-blue/50'
                }`}
            >
              <span className={`font-medium ${value === 'small' ? 'text-xs' : value === 'large' ? 'text-lg' : 'text-sm'
                } ${settings.appearance.fontSize === value ? 'text-brand-blue' : 'text-gray-600 dark:text-gray-300'
                }`}>
                {label}
              </span>
            </motion.button>
          ))}
        </div>
      </SettingCard>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile': return renderProfileSettings();
      case 'notifications': return renderNotificationSettings();
      case 'privacy': return renderPrivacySettings();
      case 'data': return renderDataManagement();
      case 'appearance': return renderAppearanceSettings();
      default: return renderProfileSettings();
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-brand-blue to-purple-600 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-gradient-to-r from-brand-blue to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-70"
        >
          {isSaving ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {t.saveChanges}
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <motion.div
          initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="sticky top-24 rounded-2xl overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-700 shadow-lg p-2">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <motion.button
                    key={section.id}
                    whileHover={{ x: isRTL ? -3 : 3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-${isRTL ? 'right' : 'left'} transition-all duration-300 ${isActive
                        ? 'bg-gradient-to-r from-brand-blue to-purple-600 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                  </motion.button>
                );
              })}
            </nav>
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}