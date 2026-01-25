import type { Contract, Property, Unit, Tenant } from '../types/database';

interface ContractTemplateProps {
    contract: Contract;
    property: Property;
    unit: Unit;
    tenant: Tenant;
}

export function ContractTemplate({ contract, property, unit, tenant }: ContractTemplateProps) {
    const formattedRent = new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(contract.rentAmount);

    return (
        <div className="print-only hidden">
            <div id="contract-to-print" className="p-12 bg-white text-gray-900 font-serif leading-relaxed" dir="rtl" style={{ width: '210mm', minHeight: '297mm', margin: 'auto' }}>
                {/* Header */}
                <div className="flex justify-between items-start border-b-4 border-slate-800 pb-8 mb-12">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">عقد إيجار موحد</h1>
                        <p className="text-slate-500 font-sans">رقم العقد: {contract.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-slate-500 font-sans">تاريخ التوثيق: {new Date().toLocaleDateString('ar-SA')}</p>
                    </div>
                    <div className="text-left" dir="ltr">
                        <div className="text-2xl font-black text-slate-900">ARKAN</div>
                        <div className="text-[10px] text-slate-400 font-sans uppercase tracking-widest">Property Management System</div>
                    </div>
                </div>

                {/* Parties */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div className="space-y-4 border-r-2 border-slate-100 pr-8">
                        <h2 className="text-xl font-bold border-b border-slate-200 pb-2 mb-4">الطرف الأول (المؤجر)</h2>
                        <div className="space-y-2">
                            <p className="flex justify-between"><span className="text-slate-500">الاسم:</span> <span className="font-bold">شركة أركان العقارية</span></p>
                            <p className="flex justify-between"><span className="text-slate-500">السجل التجاري:</span> <span className="font-bold">1010XXXXXX</span></p>
                            <p className="flex justify-between"><span className="text-slate-500">العنوان:</span> <span className="font-bold">الرياض، المملكة العربية السعودية</span></p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold border-b border-slate-200 pb-2 mb-4">الطرف الثاني (المستأجر)</h2>
                        <div className="space-y-2">
                            <p className="flex justify-between"><span className="text-slate-500">الاسم:</span> <span className="font-bold">{tenant.fullName}</span></p>
                            <p className="flex justify-between"><span className="text-slate-500">رقم الهوية/الإقامة:</span> <span className="font-bold">{tenant.nationalId}</span></p>
                            <p className="flex justify-between"><span className="text-slate-500">رقم الجوال:</span> <span className="font-bold" dir="ltr">{tenant.phone}</span></p>
                        </div>
                    </div>
                </div>

                {/* Property Details */}
                <div className="bg-slate-50 p-8 rounded-2xl mb-12 border border-slate-100">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="w-2 h-6 bg-slate-800 rounded-full"></span>
                        بيانات العين المؤجرة
                    </h2>
                    <div className="grid grid-cols-3 gap-8">
                        <div>
                            <p className="text-slate-500 text-sm mb-1">اسم المشروع/العقار</p>
                            <p className="font-bold text-lg">{property.name}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm mb-1">رقم الوحدة</p>
                            <p className="font-bold text-lg">{unit.unitNo}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm mb-1">نوع الوحدة</p>
                            <p className="font-bold text-lg">{unit.type === 'apartment' ? 'شقة' : 'فيلا'}</p>
                        </div>
                        <div className="col-span-3">
                            <p className="text-slate-500 text-sm mb-1">العنوان بالتفصيل</p>
                            <p className="font-bold">{property.address}, {property.city}</p>
                        </div>
                    </div>
                </div>

                {/* Financials & Duration */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold border-b border-slate-200 pb-2">مدة العقد</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-500">تاريخ البداية:</span>
                                <span className="font-bold">{contract.startDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">تاريخ النهاية:</span>
                                <span className="font-bold">{contract.endDate}</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold border-b border-slate-200 pb-2">الالتزامات المالية</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-500">قيمة الإيجار:</span>
                                <span className="font-bold text-xl text-slate-900">{formattedRent}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">دورية الدفع:</span>
                                <span className="font-bold">
                                    {contract.paymentFrequency === 'monthly' ? 'شهري' :
                                        contract.paymentFrequency === 'quarterly' ? 'ربع سنوي' : 'سنوي'}
                                </span>
                            </div>
                            <div className="flex justify-between text-slate-400 text-xs">
                                <span>تأمين مسترد:</span>
                                <span>{contract.depositAmount} ر.س</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer / Signatures */}
                <div className="mt-auto pt-24">
                    <div className="grid grid-cols-2 gap-24 h-48">
                        <div className="border-t-2 border-dashed border-slate-300 pt-4 text-center">
                            <p className="text-slate-400 mb-20 text-sm italic">توقيع الطرف الأول (المؤجر)</p>
                            <div className="w-32 h-32 bg-slate-50 mx-auto rounded-xl flex items-center justify-center border border-slate-100">
                                <span className="text-[10px] text-slate-300">ختم الشركة الرقمي</span>
                            </div>
                        </div>
                        <div className="border-t-2 border-dashed border-slate-300 pt-4 text-center">
                            <p className="text-slate-400 mb-20 text-sm italic">توقيع الطرف الثاني (المستأجر)</p>
                            <div className="w-32 h-32 bg-slate-50 mx-auto rounded-xl flex items-center justify-center border border-slate-100">
                                <span className="text-[10px] text-slate-300">التوقيع الإلكتروني</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 text-center text-slate-300 text-[10px] space-y-1">
                        <p>هذه الوثيقة تم إنشاؤها آلياً وغير قابلة للتعديل اليدوي</p>
                        <p>© {new Date().getFullYear()} Arkan Property Management System - All Rights Reserved</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
