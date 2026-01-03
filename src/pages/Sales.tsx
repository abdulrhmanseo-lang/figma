
import { ShoppingCart } from 'lucide-react';

export function Sales() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-brand-dark mb-1">المبيعات</h1>
                    <p className="text-gray-500">إدارة المبيعات والفواتير</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingCart className="w-10 h-10 text-brand-blue" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">قريباً</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    نعمل حالياً على تطوير نظام المبيعات المتكامل. سيتم إطلاقه في التحديث القادم.
                </p>
            </div>
        </div>
    );
}
