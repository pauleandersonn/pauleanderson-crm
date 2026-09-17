
export type Role = 'family' | 'caregiver' | 'admin';
export type PatientStatus = 'internado' | 'pós-alta';
export type SubscriptionStatus = 'active' | 'inactive';
export type PlanType = 'free' | 'premium' | 'featured'; // premium for families, featured for caregivers
export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'finished' | 'cancelled';
export type CareType = 'domiciliar' | 'hospitalar';
export type ContractType = 'diaria' | 'semanal' | 'mensal';
export type ShiftType = 'diurno' | 'noturno' | '24h';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  is_verified?: boolean;
  plan_type: PlanType;
  latitude?: number;
  longitude?: number;
}

export interface Patient {
  id: string;
  name: string;
  hospital: string;
  status: PatientStatus;
  created_by: string;
  age?: number;
}

export interface DailyUpdate {
  id: string;
  patient_id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export interface Task {
  id: string;
  patient_id: string;
  title: string;
  status: 'pending' | 'done';
}

export interface CaregiverProfile {
  id: string;
  user_id: string;
  name: string;
  bio: string;
  experience: string;
  location: string;
  availability: string;
  rating: number;
  review_count?: number;
  price_hour: number;
  avatar: string;
  is_verified: boolean;
  is_featured: boolean;
  latitude?: number;
  longitude?: number;
  distance?: number; // Calculated distance from user
}

export interface CareRequest {
  id: string;
  caregiver_id: string;
  family_id: string;
  patient_id?: string;
  patient_name: string;
  patient_age: number;
  status: RequestStatus;
  created_at: string;
  updated_at?: string;
  accepted_at?: string;
  finished_at?: string;
  shift: ShiftType;
  care_type: CareType;
  location_summary: string;
  notes?: string;
  // Transaction data
  total_value?: number;
  platform_fee?: number;
  caregiver_payout?: number;
  // Care request fields
  contract_type?: ContractType;
  agreed_value?: number;
  city?: string;
  district?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface ChatMessage {
  id: string;
  request_id: string;
  sender_id: string;
  text: string;
  message_type?: 'text' | 'image' | 'audio' | 'system';
  is_read?: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: PlanType;
  status: SubscriptionStatus;
}

// Review System
export interface Review {
  id: string;
  care_request_id: string;
  reviewer_id: string;
  reviewed_id: string;
  rating: number; // 1-5
  comment?: string;
  review_type: 'family_to_caregiver' | 'caregiver_to_family';
  created_at: string;
}

// Transactions / Payments
export interface Transaction {
  id: string;
  care_request_id?: string;
  payer_id: string;
  payee_id?: string;
  amount: number;
  platform_fee: number;
  net_amount: number;
  currency: string;
  stripe_payment_intent_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  created_at: string;
  completed_at?: string;
  description?: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  stripe_payment_method_id: string;
  type: 'card' | 'pix';
  last_four?: string;
  brand?: string;
  exp_month?: number;
  exp_year?: number;
  is_default: boolean;
  created_at: string;
}

// Push Notifications
export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

// Geolocation
export interface Coordinates {
  latitude: number;
  longitude: number;
}
