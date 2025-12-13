import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StatsCards } from '../components/StatsCards';
import { Charts } from '../components/Charts';
import { AlertsSection } from '../components/AlertsSection';
import { AIRecommendation } from '../components/AIRecommendation';
import { ContractsTable } from '../components/ContractsTable';
import { PropertiesTable } from '../components/PropertiesTable';
import { Button } from '../components/ui/button';
import { Crown, Calendar, Hash, ArrowRight } from 'lucide-react';

export function Dashboard() {
  const { user, subscription } = useAuth();

  // UI for non-subscribed users (or expired)
  if (!subscription || subscription.status === 'expired') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pt-20">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-blue to-brand-purple" />

          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-3">عذراً، الحساب غير نشط</h2>
          <p className="text-gray-500 mb-8">
            للوصول إلى لوحة التحكم وإدارة عقاراتك، يجب أن يكون لديك اشتراك فعال.
            <br />
            انتهت صلاحية اشتراكك أو لم تقم بتفعيله بعد.
          </p>

          <Link to="/pricing">
            <Button className="w-full py-3 text-lg group bg-brand-primary text-white hover:bg-brand-dark">
              اشترك الآن واستعد الوصول
              <ArrowRight className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            </Button>
          </Link>

          <div className="mt-6 text-sm text-gray-400">
            هل تعتقد أن هناك خطأ؟ <Link to="/contact" className="text-brand-blue hover:underline">تواصل مع الدعم</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 max-w-7xl mx-auto px-6">
      {/* Subscription Status Header */}
      {subscription && (
        <div className="bg-gradient-to-r from-brand-dark to-slate-900 rounded-3xl p-6 mb-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-brand-blue/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-brand-accent">
                <Crown className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">أهلاً بك، {user?.displayName || 'مستخدم'}!</h2>
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className="bg-brand-blue/20 text-brand-blue px-2 py-0.5 rounded text-xs border border-brand-blue/30">{subscription.planName}</span>
                  <span>•</span>
                  <span className="text-green-400">الاشتراك نشط</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10">
                <div className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  كود الاشتراك
                </div>
                <div className="font-mono text-lg tracking-wider text-brand-accent">{subscription.code}</div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10">
                <div className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  ينتهي في
                </div>
                <div className="font-medium text-lg">
                  {new Date(subscription.endDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <Charts />
        </div>
        <div className="lg:col-span-1">
          <PropertiesTable />
        </div>
      </div>

      <div className="mt-6">
        <ContractsTable />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-1">
          <AlertsSection />
        </div>

        <div className="lg:col-span-2">
          <AIRecommendation />
        </div>
      </div>
    </div>
  );
}
