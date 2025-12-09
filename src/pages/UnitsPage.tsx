import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MapPin, Bed, Bath, Maximize, Filter, Search } from 'lucide-react';

export const UnitsPage = () => {
    const [filter, setFilter] = useState('all');

    const units = [
        { id: 1, title: "فيلا مودرن حي الملقا", price: "85,000", loc: "الرياض - الملقا", beds: 5, baths: 4, area: "450م", type: "فيلا", status: "متاح", img: "https://images.unsplash.com/photo-1600596542815-2a4fe053155e?auto=format&fit=crop&q=80&w=800" },
        { id: 2, title: "شقة فاخرة اطلالة بحرية", price: "45,000", loc: "جدة - الشاطئ", beds: 3, baths: 2, area: "180م", type: "شقة", status: "مؤجر", img: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=800" },
        { id: 3, title: "دوبلكس متصل", price: "60,000", loc: "الدمام - الفيصلية", beds: 4, baths: 3, area: "300م", type: "دوبلكس", status: "متاح", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800" },
        { id: 4, title: "شقة استديو مؤثثة", price: "35,000", loc: "الرياض - العلياء", beds: 1, baths: 1, area: "60م", type: "شقة", status: "متاح", img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800" },
        { id: 5, title: "فيلا كلاسيك", price: "120,000", loc: "الرياض - حطين", beds: 6, baths: 5, area: "600م", type: "فيلا", status: "محجوز", img: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=800" },
        { id: 6, title: "شقة دورين (بنتاهاوس)", price: "90,000", loc: "جدة - الحمراء", beds: 4, baths: 4, area: "350م", type: "شقة", status: "متاح", img: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80&w=800" },
    ];

    return (
        <Layout>
            <div className="bg-slate-50 min-h-screen py-10 pt-24">
                <div className="container">
                    {/* Header & Search */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-brand-dark">الوحدات العقارية</h1>
                            <p className="text-gray-500">تصفح {units.length} وحدة متاحة للإيجار</p>
                        </div>
                        <div className="relative w-full md:w-96">
                            <input
                                type="text"
                                placeholder="ابحث برقم الوحدة، الحي، المدينة..."
                                className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                            />
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 mb-10">
                        {['الكل', 'متاح', 'مؤجر', 'فيلا', 'شقة'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                                        ? 'bg-brand-dark text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                        <button className="mr-auto px-4 py-2 flex items-center gap-2 text-brand-blue font-medium hover:bg-brand-light rounded-lg">
                            <Filter className="w-4 h-4" /> تصفية متقدمة
                        </button>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {units.map((unit) => (
                            <Card key={unit.id} className="p-0 border-0 shadow-sm hover:shadow-xl transition-shadow overflow-hidden group">
                                <div className="relative h-64 overflow-hidden">
                                    <img src={unit.img} alt={unit.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-white font-bold text-sm ${unit.status === 'متاح' ? 'bg-green-500' :
                                            unit.status === 'مؤجر' ? 'bg-gray-500' : 'bg-orange-500'
                                        }`}>
                                        {unit.status}
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white">
                                        <span className="font-bold text-lg drop-shadow-md">{unit.price} ر.س</span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-xl font-bold text-brand-dark mb-2">{unit.title}</h3>
                                    <div className="flex items-center gap-2 text-gray-500 mb-4 text-sm">
                                        <MapPin className="w-4 h-4 text-brand-blue" />
                                        {unit.loc}
                                    </div>
                                    <div className="flex items-center justify-between py-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                                            <Bed className="w-5 h-5 text-gray-400" /> {unit.beds} غرف
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                                            <Bath className="w-5 h-5 text-gray-400" /> {unit.baths} دورات
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                                            <Maximize className="w-5 h-5 text-gray-400" /> {unit.area}
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full mt-2">عرض التفاصيل</Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};
