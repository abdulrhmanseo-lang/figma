import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Download, Printer } from 'lucide-react';
import { useData } from '../context/DataContext';

export function BillingView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoices } = useData();

  const invoice = invoices.find(i => i.id === id);

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">الفاتورة غير موجودة</p>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate('/billing')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowRight className="w-5 h-5" />
        <span>العودة إلى الفواتير</span>
      </button>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-8 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">فاتورة</h1>
                <p className="opacity-90">رقم الفاتورة: {invoice.invoiceNumber}</p>
              </div>
              <div className="text-left">
                <p className="opacity-90 mb-1">تاريخ الإصدار</p>
                <p className="font-bold">{new Date().toLocaleDateString('ar-SA')}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Customer Info */}
            <div className="mb-8">
              <h3 className="text-sm text-gray-600 mb-2">إلى:</h3>
              <p className="text-lg font-bold" style={{ color: '#0A2A43' }}>
                {invoice.tenantName}
              </p>
            </div>

            {/* Invoice Table */}
            <table className="w-full mb-8">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-right py-3 font-semibold">البيان</th>
                  <th className="text-center py-3 font-semibold">الكمية</th>
                  <th className="text-left py-3 font-semibold">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-4">إيجار شهري</td>
                  <td className="text-center py-4">1</td>
                  <td className="text-left py-4">{invoice.amount.toLocaleString()} ر.س</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-4">ضريبة القيمة المضافة (15%)</td>
                  <td className="text-center py-4">-</td>
                  <td className="text-left py-4">{invoice.tax.toLocaleString()} ر.س</td>
                </tr>
              </tbody>
            </table>

            {/* Total */}
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">المجموع الفرعي:</span>
                  <span>{invoice.amount.toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">الضريبة:</span>
                  <span>{invoice.tax.toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-gray-300">
                  <span className="font-bold">الإجمالي:</span>
                  <span className="text-xl font-bold" style={{ color: '#0A2A43' }}>
                    {invoice.total.toLocaleString()} ر.س
                  </span>
                </div>
              </div>
            </div>

            {/* Due Date */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">تاريخ الاستحقاق</p>
              <p className="text-lg font-bold" style={{ color: '#0A2A43' }}>
                {new Date(invoice.dueDate).toLocaleDateString('ar-SA')}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-8">
              <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                <span>تحميل PDF</span>
              </button>
              <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2">
                <Printer className="w-5 h-5" />
                <span>طباعة</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
