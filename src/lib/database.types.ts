export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            properties: {
                Row: {
                    id: string
                    company_id: string
                    name: string
                    city: string
                    address: string
                    type: 'building' | 'villa' | 'complex' | 'land'
                    description: string | null
                    latitude: number | null
                    longitude: number | null
                    notes: string | null
                    images: string[]
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id: string
                    name: string
                    city: string
                    address: string
                    type: 'building' | 'villa' | 'complex' | 'land'
                    description?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    notes?: string | null
                    images?: string[]
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string
                    name?: string
                    city?: string
                    address?: string
                    type?: 'building' | 'villa' | 'complex' | 'land'
                    description?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    notes?: string | null
                    images?: string[]
                    created_at?: string
                }
            }
            units: {
                Row: {
                    id: string
                    company_id: string
                    property_id: string
                    property_name: string
                    unit_no: string
                    type: 'apartment' | 'studio' | 'office' | 'shop' | 'warehouse' | 'villa'
                    floor: string | null
                    bedrooms: number | null
                    bathrooms: number | null
                    area_sqm: number | null
                    description: string | null
                    rent_amount: number
                    status: 'vacant' | 'rented' | 'maintenance'
                    images: string[]
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id: string
                    property_id: string
                    property_name: string
                    unit_no: string
                    type: 'apartment' | 'studio' | 'office' | 'shop' | 'warehouse' | 'villa'
                    floor?: string | null
                    bedrooms?: number | null
                    bathrooms?: number | null
                    area_sqm?: number | null
                    description?: string | null
                    rent_amount: number
                    status?: 'vacant' | 'rented' | 'maintenance'
                    images?: string[]
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string
                    property_id?: string
                    property_name?: string
                    unit_no?: string
                    type?: 'apartment' | 'studio' | 'office' | 'shop' | 'warehouse' | 'villa'
                    floor?: string | null
                    bedrooms?: number | null
                    bathrooms?: number | null
                    area_sqm?: number | null
                    description?: string | null
                    rent_amount?: number
                    status?: 'vacant' | 'rented' | 'maintenance'
                    images?: string[]
                    created_at?: string
                }
            }
            tenants: {
                Row: {
                    id: string
                    company_id: string
                    full_name: string
                    national_id: string | null
                    phone: string
                    email: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id: string
                    full_name: string
                    national_id?: string | null
                    phone: string
                    email?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string
                    full_name?: string
                    national_id?: string | null
                    phone?: string
                    email?: string | null
                    created_at?: string
                }
            }
            contracts: {
                Row: {
                    id: string
                    company_id: string
                    property_id: string
                    property_name: string
                    unit_id: string
                    unit_no: string
                    tenant_id: string
                    tenant_name: string
                    start_date: string
                    end_date: string
                    rent_amount: number
                    payment_frequency: 'monthly' | 'quarterly' | 'yearly'
                    deposit_amount: number
                    notes: string | null
                    status: 'active' | 'ended' | 'suspended'
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id: string
                    property_id: string
                    property_name: string
                    unit_id: string
                    unit_no: string
                    tenant_id: string
                    tenant_name: string
                    start_date: string
                    end_date: string
                    rent_amount: number
                    payment_frequency?: 'monthly' | 'quarterly' | 'yearly'
                    deposit_amount?: number
                    notes?: string | null
                    status?: 'active' | 'ended' | 'suspended'
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string
                    property_id?: string
                    property_name?: string
                    unit_id?: string
                    unit_no?: string
                    tenant_id?: string
                    tenant_name?: string
                    start_date?: string
                    end_date?: string
                    rent_amount?: number
                    payment_frequency?: 'monthly' | 'quarterly' | 'yearly'
                    deposit_amount?: number
                    notes?: string | null
                    status?: 'active' | 'ended' | 'suspended'
                    created_at?: string
                }
            }
            payments: {
                Row: {
                    id: string
                    company_id: string
                    contract_id: string
                    tenant_name: string
                    unit_no: string
                    due_date: string
                    amount: number
                    status: 'paid' | 'due' | 'overdue'
                    paid_at: string | null
                    method: 'cash' | 'bank' | 'online' | null
                    reference: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id: string
                    contract_id: string
                    tenant_name: string
                    unit_no: string
                    due_date: string
                    amount: number
                    status?: 'paid' | 'due' | 'overdue'
                    paid_at?: string | null
                    method?: 'cash' | 'bank' | 'online' | null
                    reference?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string
                    contract_id?: string
                    tenant_name?: string
                    unit_no?: string
                    due_date?: string
                    amount?: number
                    status?: 'paid' | 'due' | 'overdue'
                    paid_at?: string | null
                    method?: 'cash' | 'bank' | 'online' | null
                    reference?: string | null
                    created_at?: string
                }
            }
            maintenance_requests: {
                Row: {
                    id: string
                    company_id: string
                    property_id: string
                    property_name: string
                    unit_id: string | null
                    unit_no: string | null
                    title: string
                    description: string
                    priority: 'low' | 'medium' | 'high' | 'urgent'
                    status: 'new' | 'in_progress' | 'done' | 'canceled'
                    cost: number
                    requested_by: 'tenant' | 'admin'
                    assigned_to: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id: string
                    property_id: string
                    property_name: string
                    unit_id?: string | null
                    unit_no?: string | null
                    title: string
                    description: string
                    priority?: 'low' | 'medium' | 'high' | 'urgent'
                    status?: 'new' | 'in_progress' | 'done' | 'canceled'
                    cost?: number
                    requested_by?: 'tenant' | 'admin'
                    assigned_to?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    company_id?: string
                    property_id?: string
                    property_name?: string
                    unit_id?: string | null
                    unit_no?: string | null
                    title?: string
                    description?: string
                    priority?: 'low' | 'medium' | 'high' | 'urgent'
                    status?: 'new' | 'in_progress' | 'done' | 'canceled'
                    cost?: number
                    requested_by?: 'tenant' | 'admin'
                    assigned_to?: string | null
                    created_at?: string
                }
            }
        }
    }
}
