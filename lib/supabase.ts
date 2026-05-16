import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const isConfigValid = supabaseUrl && supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') && 
  !supabaseAnonKey.includes('placeholder');

if (!isConfigValid) {
  console.warn('⚠️ Supabase not configured. Using offline/demo mode.');
}

export const supabase = createClient(
  supabaseUrl || 'https://demo.local',
  supabaseAnonKey || 'demo-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
    },
  }
);

export const isSupabaseConfigured = () => isConfigValid;

export type User = {
  id: string;
  email: string;
  name: string;
  plan: 'none' | 'free' | 'basic' | 'pro' | 'premium';
  status: 'active' | 'inactive';
  role: 'admin' | 'user';
  created_at: string;
  phone?: string;
  policy_number?: string;
  avatar_url?: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  plan_id: 'free' | 'basic' | 'pro' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
  start_date: string;
  end_date: string | null;
  next_billing_date: string;
  created_at: string;
};

export type SupportRequest = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  message: string;
  category: 'legal' | 'immigration' | 'tax' | 'housing' | 'education' | 'job' | 'emergency' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  created_at: string;
};

export type LearningArticle = {
  id: string;
  title: string;
  category: 'tax' | 'immigration' | 'housing' | 'legal' | 'career';
  description: string;
  content: string;
  readTime: number;
  created_at: string;
};

export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0.00,
    color: ['#94A3B8', '#475569'] as const,
    benefits: [
      'Community forum access',
      'Public learning center guides',
      'Basic emergency contacts',
      'Limited email support',
    ],
    featured: false,
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 27.99,
    color: ['#10B981', '#059669'] as const,
    benefits: [
      'Basic legal guidance consultation',
      'Immigration support resources',
      'Tax return assistance guides',
      'Housing support information',
      'Email support within 48 hours',
      'Access to community forum',
      'Learning center access',
    ],
    featured: false,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 29.99,
    color: ['#0EA5E9', '#2563EB'] as const,
    benefits: [
      'Everything in Basic',
      'Priority legal guidance',
      'Immigration document review',
      'Tax filing assistance',
      'Housing application support',
      'Education scholarship guidance',
      '24-hour email support',
      'Monthly consultation call',
      'Priority request handling',
    ],
    featured: true,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 33.99,
    color: ['#8B5CF6', '#6366F1'] as const,
    benefits: [
      'Everything in Pro',
      'Unlimited legal consultations',
      'Full immigration case support',
      'Complete tax preparation help',
      'Emergency housing assistance',
      'Career coaching sessions',
      'App account recovery support',
      'Dedicated support line',
      'Priority 4-hour response',
      'Quarterly benefits review',
      'Unlimited requests',
    ],
    featured: false,
  },
} as const;

export const BENEFIT_CATEGORIES = {
  legal: {
    id: 'legal',
    title: 'Legal Support',
    description: 'Access professional legal guidance through our partner network. Get help with document review, legal consultations, and referrals to qualified attorneys.',
    icon: 'Scale',
    color: '#3B82F6',
    features: [
      'Legal document review',
      'Basic consultation access',
      'Attorney referrals',
      'Rights education',
    ],
  },
  immigration: {
    id: 'immigration',
    title: 'Immigration Assistance',
    description: 'Navigate the complex immigration system with expert guidance. From visa applications to citizenship processes, we are here to help.',
    icon: 'Globe',
    color: '#10B981',
    features: [
      'Visa application guidance',
      'Green card support',
      'Citizenship process help',
      'Document preparation',
    ],
  },
  housing: {
    id: 'housing',
    title: 'Housing Support',
    description: 'Find stable housing and understand your rights as a tenant. Access resources for rental assistance, shelter, and affordable housing programs.',
    icon: 'Home',
    color: '#F59E0B',
    features: [
      'Rental application help',
      'Tenant rights guidance',
      'Affordable housing resources',
      'Emergency shelter access',
    ],
  },
  tax: {
    id: 'tax',
    title: 'Tax Services',
    description: 'Maximize your returns and stay compliant with professional tax assistance. Our partners help with filing, deductions, and tax planning.',
    icon: 'Calculator',
    color: '#8B5CF6',
    features: [
      'Tax return preparation',
      'Deduction optimization',
      'IRS correspondence help',
      'Tax planning guidance',
    ],
  },
  education: {
    id: 'education',
    title: 'Education & Career',
    description: 'Advance your education and career with scholarship guidance, resume reviews, and professional development resources.',
    icon: 'GraduationCap',
    color: '#EC4899',
    features: [
      'Scholarship search assistance',
      'Resume & cover letter review',
      'Interview preparation',
      'Career coaching sessions',
    ],
  },
  emergency: {
    id: 'emergency',
    title: 'Emergency Assistance',
    description: '24/7 access to emergency support networks. Get immediate help during crises including housing, food, and crisis intervention.',
    icon: 'ShieldAlert',
    color: '#EF4444',
    features: [
      '24/7 crisis hotline',
      'Emergency housing',
      'Food assistance',
      'Crisis intervention',
    ],
  },
} as const;

export const BENEFITS = [
  {
    id: 'legal',
    title: 'Legal Guidance',
    description: 'Access to legal consultations and guidance for common issues. Our partner network provides basic legal advice, document review, and referrals to qualified attorneys when needed.',
    icon: 'Scale',
    category: 'Legal',
  },
  {
    id: 'immigration',
    title: 'Immigration Support',
    description: 'Navigate the immigration system with confidence. Get help with forms, understand your rights, and receive guidance on visas, green cards, and citizenship processes.',
    icon: 'Globe',
    category: 'Immigration',
  },
  {
    id: 'tax',
    title: 'Tax Return Assistance',
    description: 'Expert help with tax preparation and filing. Our tax specialists assist with individual returns, deductions, credits, and ensure you maximize your refund while staying compliant.',
    icon: 'Calculator',
    category: 'Finance',
  },
  {
    id: 'housing',
    title: 'Housing Support',
    description: 'Find housing solutions and understand your tenant rights. Get assistance with rental applications, shelter resources, and guidance on affordable housing programs.',
    icon: 'Home',
    category: 'Housing',
  },
  {
    id: 'education',
    title: 'Education & Scholarships',
    description: 'Unlock educational opportunities with guidance on scholarships, financial aid, and enrollment processes. We help you find resources to advance your education.',
    icon: 'GraduationCap',
    category: 'Education',
  },
  {
    id: 'job',
    title: 'Job & Employment',
    description: 'Accelerate your career with resume reviews, interview preparation, and job search strategies. Connect with employment resources and training opportunities.',
    icon: 'Briefcase',
    category: 'Career',
  },
  {
    id: 'emergency',
    title: 'Emergency Assistance',
    description: '24/7 access to emergency support networks. Get immediate help during crises, including emergency housing, food assistance, and crisis intervention resources.',
    icon: 'Shield',
    category: 'Emergency',
  },
  {
    id: 'recovery',
    title: 'Account Recovery',
    description: 'Regain access to your digital life. We help recover locked or hacked accounts for Uber, DoorDash, and other essential service platforms.',
    icon: 'KeyRound',
    category: 'Digital',
  },
] as const;

export const LEARNING_ARTICLES: LearningArticle[] = [
  {
    id: '1',
    title: 'learn.articles.tax.title',
    category: 'tax',
    description: 'learn.articles.tax.description',
    content: 'learn.articles.tax.content',
    readTime: 5,
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    title: 'learn.articles.immigration.title',
    category: 'immigration',
    description: 'learn.articles.immigration.description',
    content: 'learn.articles.immigration.content',
    readTime: 8,
    created_at: '2024-01-20T00:00:00Z',
  },
  {
    id: '3',
    title: 'learn.articles.housing.title',
    category: 'housing',
    description: 'learn.articles.housing.description',
    content: 'learn.articles.housing.content',
    readTime: 6,
    created_at: '2024-01-25T00:00:00Z',
  },
  {
    id: '4',
    title: 'learn.articles.legal.title',
    category: 'legal',
    description: 'learn.articles.legal.description',
    content: 'learn.articles.legal.content',
    readTime: 7,
    created_at: '2024-02-01T00:00:00Z',
  },
  {
    id: '5',
    title: 'learn.articles.career.title',
    category: 'career',
    description: 'learn.articles.career.description',
    content: 'learn.articles.career.content',
    readTime: 6,
    created_at: '2024-02-05T00:00:00Z',
  },
];

export const PRIORITY_OPTIONS = [
  { id: 'low', label: 'support.priority_low_label', description: 'support.priority_low_desc', color: '#64748B' },
  { id: 'medium', label: 'support.priority_medium_label', description: 'support.priority_medium_desc', color: '#F59E0B' },
  { id: 'high', label: 'support.priority_high_label', description: 'support.priority_high_desc', color: '#EF4444' },
  { id: 'urgent', label: 'support.priority_urgent_label', description: 'support.priority_urgent_desc', color: '#DC2626' },
] as const;
