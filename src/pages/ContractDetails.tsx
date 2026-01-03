import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, RefreshCw, Calendar, FileText, User, Home } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { formatSAR, formatDate, daysRemaining } from '../lib/format';
import { toast } from 'sonner';

export function ContractDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { contracts, payments, tenants, updateContract } = useData();

  const contract = contracts.find(c => c.id === id);
  const contractPayments = payments.filter(p => p.contractId === id);
  const tenant = contract ? tenants.find(t => t.id === contract.tenantId) : null;

  if (!contract) {
    return (
      <Layout>
        <div className="pt-24 pb-12 max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-500">العقد غير موجود</p>
          <Link to="/app/contracts" className="mt-4 text-brand-blue hover:underline">
            العودة إلى قائمة العقود
          </Link>
        </div>
      </Layout>
    );
  }

  const days = daysRemaining(contract.endDate);
  const paidCount = contractPayments.filter(p => p.status === 'paid').length;
  const overdueCount = contractPayments.filter(p => p.status === 'overdue').length;

  const handleRenewContract = () => {
    const endDate = new Date(contract.endDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    updateContract(contract.id, {
      endDate: endDate.toISOString().split('T')[0],
      status: 'active',
    });

    toast.success('تم تجديد العقد بنجاح لمدة سنة إضافية');
  };

  const handleEndContract = () => {
    if (confirm('هل أنت متأكد من إنهاء هذا العقد؟')) {
      updateContract(contract.id, { status: 'ended' });
      toast.success('تم إنهاء العقد');
    }
  };

  return (
    <Layout>
      <div className="pt-24 pb-12 max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/app" className="hover:text-brand-blue">لوحة التحكم</Link>
          <span>/</span>
          <Link to="/app/contracts" className="hover:text-brand-blue">العقود</Link>
          <span>/</span>
          <span className="text-brand-dark font-medium">تفاصيل العقد</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contract Header */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-brand-blue to-cyan-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">عقد إيجار</h1>
                    <p className="opacity-90">رقم العقد: {contract.id.slice(0, 8)}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${contract.status === 'active' ? 'bg-white/20 border border-white/40' :
                      contract.status === 'ended' ? 'bg-red-500/20 border border-red-300/40' :
                        'bg-amber-500/20 border border-amber-300/40'
                    }`}>
                    {contract.status === 'active' ? 'نشط' :
                      contract.status === 'ended' ? 'منتهي' : 'معلق'}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">قيمة الإيجار</p>
                    <p className="text-xl font-bold text-brand-dark">{formatSAR(contract.rentAmount)}</p>
                    <p className="text-xs text-gray-400">
                      {contract.paymentFrequency === 'monthly' ? 'شهري' :
                        contract.paymentFrequency === 'quarterly' ? 'ربع سنوي' : 'سنوي'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">المدة المتبقية</p>
                    <p className={`text-xl font-bold ${days < 30 ? 'text-red-600' : days < 90 ? 'text-amber-600' : 'text-green-600'}`}>
                      {days > 0 ? `${days} يوم` : 'منتهي'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">الدفعات المسددة</p>
                    <p className="text-xl font-bold text-green-600">{paidCount}/{contractPayments.length}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">متأخرة</p>
                    <p className="text-xl font-bold text-red-600">{overdueCount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-brand-dark">جدول الدفعات</h2>
                <Link to={`/app/payments?contract=${contract.id}`}>
                  <Button variant="outline" size="sm">عرض الكل</Button>
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">تاريخ الاستحقاق</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">المبلغ</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {contractPayments.slice(0, 6).map(payment => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{formatDate(payment.dueDate)}</td>
                        <td className="px-4 py-3 text-sm font-medium">{formatSAR(payment.amount)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${payment.status === 'paid' ? 'bg-green-100 text-green-700' :
                              payment.status === 'overdue' ? 'bg-red-100 text-red-700' :
                                'bg-amber-100 text-amber-700'
                            }`}>
                            {payment.status === 'paid' ? 'مسدد' :
                              payment.status === 'overdue' ? 'متأخر' : 'مستحق'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contract Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-brand-dark mb-4">بيانات العقد</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">المستأجر</p>
                    <p className="font-medium">{contract.tenantName}</p>
                    {tenant && <p className="text-sm text-gray-500">{tenant.phone}</p>}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Home className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">العقار / الوحدة</p>
                    <p className="font-medium">{contract.propertyName}</p>
                    <p className="text-sm text-gray-500">وحدة {contract.unitNo}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">مدة العقد</p>
                    <p className="font-medium">{formatDate(contract.startDate)}</p>
                    <p className="text-sm text-gray-500">إلى {formatDate(contract.endDate)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-brand-dark mb-4">الإجراءات</h3>

              <div className="space-y-3">
                {contract.status === 'active' && (
                  <>
                    <Button
                      onClick={handleRenewContract}
                      variant="gradient"
                      className="w-full"
                    >
                      <RefreshCw className="w-4 h-4 ml-2" />
                      تجديد العقد
                    </Button>

                    <Button
                      onClick={handleEndContract}
                      variant="outline"
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    >
                      إنهاء العقد
                    </Button>
                  </>
                )}

                <Link to={`/app/payments?contract=${contract.id}`}>
                  <Button variant="outline" className="w-full">
                    <FileText className="w-4 h-4 ml-2" />
                    عرض الدفعات
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
