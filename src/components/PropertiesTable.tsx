import { Building, MapPin, ArrowLeft } from 'lucide-react';
import { Button } from './ui/Button';

export function PropertiesTable() {
    const properties = [
        {
            id: "PROP-001",
            name: "برج العليا التجاري",
            location: "الرياض - العليا",
            units: 45,
            occupied: 42,
            occupancyRate: 93,
            image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=150"
        },
        {
            id: "PROP-002",
            name: "مجمع النخيل السكني",
            location: "الرياض - الصحافة",
            units: 120,
            occupied: 110,
            occupancyRate: 91,
            image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=150"
        },
        {
            id: "PROP-003",
            name: "مركز الشاطئ بلازا",
            location: "جدة - الشاطئ",
            units: 25,
            occupied: 18,
            occupancyRate: 72,
            image: "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&q=80&w=150"
        },
    ];

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Building className="w-5 h-5 text-brand-purple" />
                        أداء العقارات
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">نسب التشغيل والإشغال</p>
                </div>
            </div>

            <div className="space-y-4">
                {properties.map((prop) => (
                    <div key={prop.id} className="flex gap-4 p-3 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-colors">
                        <img src={prop.image} alt={prop.name} className="w-16 h-16 rounded-xl object-cover" />

                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-gray-800">{prop.name}</h4>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${prop.occupancyRate >= 90 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {prop.occupancyRate}%
                                </span>
                            </div>

                            <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                                <MapPin className="w-3 h-3" />
                                {prop.location}
                            </div>

                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="bg-brand-purple h-full rounded-full"
                                    style={{ width: `${prop.occupancyRate}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                <span>{prop.occupied} مشغول</span>
                                <span>{prop.units} إجمالي</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Button variant="ghost" className="w-full mt-4 text-brand-purple hover:bg-purple-50">
                عرض جميع العقارات
            </Button>
        </div>
    );
}
