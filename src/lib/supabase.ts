// ===========================================
// SUPABASE CLIENT CONFIGURATION
// ===========================================

import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database Types (will be auto-generated later with Supabase CLI)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'user' | 'viewer';
          avatar: string | null;
          created_at: string;
          last_login: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role?: 'admin' | 'user' | 'viewer';
          avatar?: string | null;
          created_at?: string;
          last_login?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'admin' | 'user' | 'viewer';
          avatar?: string | null;
          created_at?: string;
          last_login?: string | null;
        };
      };
      banks: {
        Row: {
          id: string;
          name: string;
          logo: string;
          default_eft_fee: number;
          agreement_type: 'standart' | 'ozel' | 'kurumsal';
          color: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          logo: string;
          default_eft_fee: number;
          agreement_type: 'standart' | 'ozel' | 'kurumsal';
          color: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          logo?: string;
          default_eft_fee?: number;
          agreement_type?: 'standart' | 'ozel' | 'kurumsal';
          color?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      pos_devices: {
        Row: {
          id: string;
          bank_id: string;
          branch_id: string;
          terminal_no: string;
          settlement_type: 'nextDay' | 'blocked' | 'hybrid';
          blocked_days: number | null;
          hybrid_ratio: any | null;
          monthly_maintenance_fee: number;
          is_active: boolean;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          bank_id: string;
          branch_id: string;
          terminal_no: string;
          settlement_type: 'nextDay' | 'blocked' | 'hybrid';
          blocked_days?: number | null;
          hybrid_ratio?: any | null;
          monthly_maintenance_fee: number;
          is_active?: boolean;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          bank_id?: string;
          branch_id?: string;
          terminal_no?: string;
          settlement_type?: 'nextDay' | 'blocked' | 'hybrid';
          blocked_days?: number | null;
          hybrid_ratio?: any | null;
          monthly_maintenance_fee?: number;
          is_active?: boolean;
          user_id?: string;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          date: string;
          gross_amount: number;
          card_type: 'bireysel' | 'ticari';
          installment_count: number;
          pos_id: string;
          branch_id: string;
          bank_id: string;
          commission_rate: number | null;
          commission_amount: number | null;
          net_amount: number | null;
          eft_fee: number | null;
          final_amount: number | null;
          value_date: string | null;
          status: 'beklemede' | 'islendi' | 'transfer_edildi';
          card_last_four: string | null;
          auth_code: string | null;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          gross_amount: number;
          card_type: 'bireysel' | 'ticari';
          installment_count: number;
          pos_id: string;
          branch_id: string;
          bank_id: string;
          commission_rate?: number | null;
          commission_amount?: number | null;
          net_amount?: number | null;
          eft_fee?: number | null;
          final_amount?: number | null;
          value_date?: string | null;
          status?: 'beklemede' | 'islendi' | 'transfer_edildi';
          card_last_four?: string | null;
          auth_code?: string | null;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          gross_amount?: number;
          card_type?: 'bireysel' | 'ticari';
          installment_count?: number;
          pos_id?: string;
          branch_id?: string;
          bank_id?: string;
          commission_rate?: number | null;
          commission_amount?: number | null;
          net_amount?: number | null;
          eft_fee?: number | null;
          final_amount?: number | null;
          value_date?: string | null;
          status?: 'beklemede' | 'islendi' | 'transfer_edildi';
          card_last_four?: string | null;
          auth_code?: string | null;
          user_id?: string;
          created_at?: string;
        };
      };
      commission_rates: {
        Row: {
          id: string;
          bank_id: string;
          pos_id: string | null;
          card_type: 'bireysel' | 'ticari';
          installment_count: number;
          rate: number;
          valid_from: string;
          valid_to: string | null;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          bank_id: string;
          pos_id?: string | null;
          card_type: 'bireysel' | 'ticari';
          installment_count: number;
          rate: number;
          valid_from: string;
          valid_to?: string | null;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          bank_id?: string;
          pos_id?: string | null;
          card_type?: 'bireysel' | 'ticari';
          installment_count?: number;
          rate?: number;
          valid_from?: string;
          valid_to?: string | null;
          user_id?: string;
          created_at?: string;
        };
      };
    };
  };
};
