import { useAuth } from '../context/AuthContext';
import { StatsCards } from '../components/StatsCards';
import { Charts } from '../components/Charts';
import { AlertsSection } from '../components/AlertsSection';
import { AIRecommendation } from '../components/AIRecommendation';
import { Crown, Calendar, Hash } from 'lucide-react';

export function Dashboard() {
  const { user, subscription } = useAuth();

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
                <h2 className="text-2xl font-bold mb-1">أهلاً بك، {user?.name || 'مستخدم'}!</h2>
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
      <Charts />

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
