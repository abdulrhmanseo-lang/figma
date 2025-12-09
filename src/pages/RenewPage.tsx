import React from 'react';
import { PricingPage } from './PricingPage';
import { Layout } from '../components/layout/Layout';

export const RenewPage = () => {
    return (
        <div className="pt-10">
            <div className="text-center mb-[-50px] relative z-10">
                <h1 className="text-3xl font-bold text-brand-dark mb-2">تجديد الاشتراك</h1>
                <p className="text-gray-500">اختر الباقة التي تناسب احتياجاتك لتمديد فترة صلاحية حسابك</p>
            </div>
            <PricingPage />
        </div>
    );
};
