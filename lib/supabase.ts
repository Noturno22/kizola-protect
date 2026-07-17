import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const isConfigValid = supabaseUrl && supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') && 
  !supabaseAnonKey.includes('placeholder');

if (!isConfigValid) {
  console.warn('⚠️ Supabase not configured. Using offline/demo mode.');
}

const secureStorageAdapter = {
  getItem: async (key: string) => {
    try { return await SecureStore.getItemAsync(key); }
    catch { return null; }
  },
  setItem: async (key: string, value: string) => {
    try { await SecureStore.setItemAsync(key, value); }
    catch { /* SecureStore unavailable on web */ }
  },
  removeItem: async (key: string) => {
    try { await SecureStore.deleteItemAsync(key); }
    catch { /* SecureStore unavailable on web */ }
  },
};

export const supabase = createClient(
  supabaseUrl || 'https://demo.local',
  supabaseAnonKey || 'demo-key',
  {
    auth: {
      storage: secureStorageAdapter,
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
  role: 'user' | 'support' | 'finance' | 'admin' | 'super_admin' | 'viewer';
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

export type UserDocument = {
  id: string;
  user_id: string;
  name: string;
  file_path: string;
  file_url: string;
  file_type: string;
  file_size: number;
  status: 'uploaded' | 'pending' | 'verified' | 'rejected';
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

export type ArticleDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type LearningArticle = {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  readTime: number;
  difficulty: ArticleDifficulty;
  tags: readonly string[];
  coverImage?: string;
  featured?: boolean;
  popular?: boolean;
  relatedArticles?: readonly string[];
  created_at: string;
  updated_at?: string;
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
    price: 19.99,
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
    price: 34.99,
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
    price: 49.99,
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
  // ─── TAX (5) ──────────────────────────────────────────
  {
    id: 'tax-1',
    title: 'learn.articles.tax.1.title',
    category: 'tax',
    description: 'learn.articles.tax.1.description',
    content: 'learn.articles.tax.1.content',
    readTime: 5,
    difficulty: 'beginner',
    tags: ['tax', 'filing', 'W-2', 'beginner'],
    coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=400&fit=crop&auto=format',
    featured: true,
    popular: true,
    relatedArticles: ['tax-2', 'tax-3'],
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'tax-2',
    title: 'learn.articles.tax.2.title',
    category: 'tax',
    description: 'learn.articles.tax.2.description',
    content: 'learn.articles.tax.2.content',
    readTime: 7,
    difficulty: 'intermediate',
    tags: ['tax', 'deductions', 'savings'],
    coverImage: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=400&fit=crop&auto=format',
    popular: true,
    relatedArticles: ['tax-1', 'tax-4'],
    created_at: '2024-01-18T00:00:00Z',
  },
  {
    id: 'tax-3',
    title: 'learn.articles.tax.3.title',
    category: 'tax',
    description: 'learn.articles.tax.3.description',
    content: 'learn.articles.tax.3.content',
    readTime: 8,
    difficulty: 'intermediate',
    tags: ['tax', 'self-employed', '1099', 'business'],
    coverImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['tax-1', 'tax-5'],
    created_at: '2024-01-22T00:00:00Z',
  },
  {
    id: 'tax-4',
    title: 'learn.articles.tax.4.title',
    category: 'tax',
    description: 'learn.articles.tax.4.description',
    content: 'learn.articles.tax.4.content',
    readTime: 5,
    difficulty: 'beginner',
    tags: ['tax', 'refund', 'filing'],
    coverImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['tax-1', 'tax-2'],
    created_at: '2024-01-28T00:00:00Z',
  },
  {
    id: 'tax-5',
    title: 'learn.articles.tax.5.title',
    category: 'tax',
    description: 'learn.articles.tax.5.description',
    content: 'learn.articles.tax.5.content',
    readTime: 9,
    difficulty: 'advanced',
    tags: ['tax', 'state', 'local', 'income'],
    coverImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['tax-1', 'tax-3'],
    created_at: '2024-02-02T00:00:00Z',
  },

  // ─── IMMIGRATION (5) ────────────────────────────────────
  {
    id: 'immigration-1',
    title: 'learn.articles.immigration.1.title',
    category: 'immigration',
    description: 'learn.articles.immigration.1.description',
    content: 'learn.articles.immigration.1.content',
    readTime: 8,
    difficulty: 'beginner',
    tags: ['immigration', 'visa', 'overview'],
    coverImage: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=400&fit=crop&auto=format',
    featured: true,
    popular: true,
    relatedArticles: ['immigration-2', 'immigration-3'],
    created_at: '2024-01-20T00:00:00Z',
  },
  {
    id: 'immigration-2',
    title: 'learn.articles.immigration.2.title',
    category: 'immigration',
    description: 'learn.articles.immigration.2.description',
    content: 'learn.articles.immigration.2.content',
    readTime: 10,
    difficulty: 'intermediate',
    tags: ['immigration', 'green-card', 'permanent-resident'],
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop&auto=format',
    popular: true,
    relatedArticles: ['immigration-1', 'immigration-3'],
    created_at: '2024-01-25T00:00:00Z',
  },
  {
    id: 'immigration-3',
    title: 'learn.articles.immigration.3.title',
    category: 'immigration',
    description: 'learn.articles.immigration.3.description',
    content: 'learn.articles.immigration.3.content',
    readTime: 12,
    difficulty: 'advanced',
    tags: ['immigration', 'citizenship', 'naturalization'],
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['immigration-1', 'immigration-2'],
    created_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'immigration-4',
    title: 'learn.articles.immigration.4.title',
    category: 'immigration',
    description: 'learn.articles.immigration.4.description',
    content: 'learn.articles.immigration.4.content',
    readTime: 7,
    difficulty: 'intermediate',
    tags: ['immigration', 'DACA', 'dreamers'],
    coverImage: 'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['immigration-1', 'immigration-5'],
    created_at: '2024-02-05T00:00:00Z',
  },
  {
    id: 'immigration-5',
    title: 'learn.articles.immigration.5.title',
    category: 'immigration',
    description: 'learn.articles.immigration.5.description',
    content: 'learn.articles.immigration.5.content',
    readTime: 8,
    difficulty: 'beginner',
    tags: ['immigration', 'work-permit', 'EAD', 'authorization'],
    coverImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['immigration-1', 'immigration-4'],
    created_at: '2024-02-10T00:00:00Z',
  },

  // ─── HOUSING (5) ────────────────────────────────────────
  {
    id: 'housing-1',
    title: 'learn.articles.housing.1.title',
    category: 'housing',
    description: 'learn.articles.housing.1.description',
    content: 'learn.articles.housing.1.content',
    readTime: 6,
    difficulty: 'beginner',
    tags: ['housing', 'tenant', 'rights'],
    coverImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=400&fit=crop&auto=format',
    featured: true,
    popular: true,
    relatedArticles: ['housing-2', 'housing-3'],
    created_at: '2024-01-25T00:00:00Z',
  },
  {
    id: 'housing-2',
    title: 'learn.articles.housing.2.title',
    category: 'housing',
    description: 'learn.articles.housing.2.description',
    content: 'learn.articles.housing.2.content',
    readTime: 7,
    difficulty: 'intermediate',
    tags: ['housing', 'lease', 'contract', 'agreement'],
    coverImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=400&fit=crop&auto=format',
    popular: true,
    relatedArticles: ['housing-1', 'housing-4'],
    created_at: '2024-01-28T00:00:00Z',
  },
  {
    id: 'housing-3',
    title: 'learn.articles.housing.3.title',
    category: 'housing',
    description: 'learn.articles.housing.3.description',
    content: 'learn.articles.housing.3.content',
    readTime: 8,
    difficulty: 'advanced',
    tags: ['housing', 'eviction', 'protection', 'legal'],
    coverImage: 'https://images.unsplash.com/photo-1534081333815-ae5019106622?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['housing-1', 'housing-2'],
    created_at: '2024-02-02T00:00:00Z',
  },
  {
    id: 'housing-4',
    title: 'learn.articles.housing.4.title',
    category: 'housing',
    description: 'learn.articles.housing.4.description',
    content: 'learn.articles.housing.4.content',
    readTime: 5,
    difficulty: 'beginner',
    tags: ['housing', 'deposit', 'security', 'rent'],
    coverImage: 'https://images.unsplash.com/photo-1531299204812-e6d44d9a185c?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['housing-1', 'housing-2'],
    created_at: '2024-02-08T00:00:00Z',
  },
  {
    id: 'housing-5',
    title: 'learn.articles.housing.5.title',
    category: 'housing',
    description: 'learn.articles.housing.5.description',
    content: 'learn.articles.housing.5.content',
    readTime: 7,
    difficulty: 'beginner',
    tags: ['housing', 'fair', 'discrimination', 'civil-rights'],
    coverImage: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['housing-1', 'housing-3'],
    created_at: '2024-02-12T00:00:00Z',
  },

  // ─── LEGAL (5) ──────────────────────────────────────────
  {
    id: 'legal-1',
    title: 'learn.articles.legal.1.title',
    category: 'legal',
    description: 'learn.articles.legal.1.description',
    content: 'learn.articles.legal.1.content',
    readTime: 6,
    difficulty: 'beginner',
    tags: ['legal', 'lawyer', 'attorney'],
    coverImage: 'https://images.unsplash.com/photo-1453747063559-36695c8771bd?w=800&h=400&fit=crop&auto=format',
    featured: true,
    popular: true,
    relatedArticles: ['legal-2', 'legal-3'],
    created_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'legal-2',
    title: 'learn.articles.legal.2.title',
    category: 'legal',
    description: 'learn.articles.legal.2.description',
    content: 'learn.articles.legal.2.content',
    readTime: 6,
    difficulty: 'beginner',
    tags: ['legal', 'free', 'aid', 'nonprofit'],
    coverImage: 'https://images.unsplash.com/photo-1523309996740-d5315f9cc28b?w=800&h=400&fit=crop&auto=format',
    popular: true,
    relatedArticles: ['legal-1', 'legal-3'],
    created_at: '2024-02-05T00:00:00Z',
  },
  {
    id: 'legal-3',
    title: 'learn.articles.legal.3.title',
    category: 'legal',
    description: 'learn.articles.legal.3.description',
    content: 'learn.articles.legal.3.content',
    readTime: 8,
    difficulty: 'beginner',
    tags: ['legal', 'rights', 'police', 'ICE'],
    coverImage: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=400&fit=crop&auto=format',
    featured: true,
    relatedArticles: ['legal-1', 'legal-2'],
    created_at: '2024-02-08T00:00:00Z',
  },
  {
    id: 'legal-4',
    title: 'learn.articles.legal.4.title',
    category: 'legal',
    description: 'learn.articles.legal.4.description',
    content: 'learn.articles.legal.4.content',
    readTime: 5,
    difficulty: 'beginner',
    tags: ['legal', 'traffic', 'ticket', 'driving'],
    coverImage: 'https://images.unsplash.com/photo-1605106702734-205df224ecce?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['legal-1', 'legal-5'],
    created_at: '2024-02-12T00:00:00Z',
  },
  {
    id: 'legal-5',
    title: 'learn.articles.legal.5.title',
    category: 'legal',
    description: 'learn.articles.legal.5.description',
    content: 'learn.articles.legal.5.content',
    readTime: 8,
    difficulty: 'intermediate',
    tags: ['legal', 'employment', 'workplace', 'labor'],
    coverImage: 'https://images.unsplash.com/photo-1512850183-6d7990f42385?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['legal-1', 'legal-3'],
    created_at: '2024-02-15T00:00:00Z',
  },

  // ─── CAREER (5) ─────────────────────────────────────────
  {
    id: 'career-1',
    title: 'learn.articles.career.1.title',
    category: 'career',
    description: 'learn.articles.career.1.description',
    content: 'learn.articles.career.1.content',
    readTime: 7,
    difficulty: 'beginner',
    tags: ['career', 'resume', 'CV', 'job-search'],
    coverImage: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&h=400&fit=crop&auto=format',
    featured: true,
    popular: true,
    relatedArticles: ['career-2', 'career-3'],
    created_at: '2024-02-05T00:00:00Z',
  },
  {
    id: 'career-2',
    title: 'learn.articles.career.2.title',
    category: 'career',
    description: 'learn.articles.career.2.description',
    content: 'learn.articles.career.2.content',
    readTime: 6,
    difficulty: 'beginner',
    tags: ['career', 'interview', 'hiring'],
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=400&fit=crop&auto=format',
    popular: true,
    relatedArticles: ['career-1', 'career-3'],
    created_at: '2024-02-08T00:00:00Z',
  },
  {
    id: 'career-3',
    title: 'learn.articles.career.3.title',
    category: 'career',
    description: 'learn.articles.career.3.description',
    content: 'learn.articles.career.3.content',
    readTime: 7,
    difficulty: 'intermediate',
    tags: ['career', 'networking', 'connections', 'LinkedIn'],
    coverImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['career-1', 'career-4'],
    created_at: '2024-02-12T00:00:00Z',
  },
  {
    id: 'career-4',
    title: 'learn.articles.career.4.title',
    category: 'career',
    description: 'learn.articles.career.4.description',
    content: 'learn.articles.career.4.content',
    readTime: 6,
    difficulty: 'beginner',
    tags: ['career', 'LinkedIn', 'profile', 'online'],
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['career-3', 'career-5'],
    created_at: '2024-02-15T00:00:00Z',
  },
  {
    id: 'career-5',
    title: 'learn.articles.career.5.title',
    category: 'career',
    description: 'learn.articles.career.5.description',
    content: 'learn.articles.career.5.content',
    readTime: 8,
    difficulty: 'intermediate',
    tags: ['career', 'change', 'transition', 'pivot'],
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['career-1', 'career-3'],
    created_at: '2024-02-18T00:00:00Z',
  },

  // ─── HEALTH (5) ─────────────────────────────────────────
  {
    id: 'health-1',
    title: 'learn.articles.health.1.title',
    category: 'health',
    description: 'learn.articles.health.1.description',
    content: 'learn.articles.health.1.content',
    readTime: 8,
    difficulty: 'beginner',
    tags: ['health', 'insurance', 'coverage', 'HMO'],
    coverImage: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&h=400&fit=crop&auto=format',
    featured: true,
    popular: true,
    relatedArticles: ['health-2', 'health-3'],
    created_at: '2024-02-20T00:00:00Z',
  },
  {
    id: 'health-2',
    title: 'learn.articles.health.2.title',
    category: 'health',
    description: 'learn.articles.health.2.description',
    content: 'learn.articles.health.2.content',
    readTime: 7,
    difficulty: 'beginner',
    tags: ['health', 'Medicaid', 'low-income', 'qualify'],
    coverImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&h=400&fit=crop&auto=format',
    popular: true,
    relatedArticles: ['health-1', 'health-3'],
    created_at: '2024-02-22T00:00:00Z',
  },
  {
    id: 'health-3',
    title: 'learn.articles.health.3.title',
    category: 'health',
    description: 'learn.articles.health.3.description',
    content: 'learn.articles.health.3.content',
    readTime: 6,
    difficulty: 'beginner',
    tags: ['health', 'emergency', 'hospital', 'ER'],
    coverImage: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['health-1', 'health-2'],
    created_at: '2024-02-25T00:00:00Z',
  },
  {
    id: 'health-4',
    title: 'learn.articles.health.4.title',
    category: 'health',
    description: 'learn.articles.health.4.description',
    content: 'learn.articles.health.4.content',
    readTime: 7,
    difficulty: 'intermediate',
    tags: ['health', 'mental', 'therapy', 'counseling'],
    coverImage: 'https://images.unsplash.com/photo-1561487138-99ccf59b135c?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['health-1', 'health-5'],
    created_at: '2024-02-28T00:00:00Z',
  },
  {
    id: 'health-5',
    title: 'learn.articles.health.5.title',
    category: 'health',
    description: 'learn.articles.health.5.description',
    content: 'learn.articles.health.5.content',
    readTime: 6,
    difficulty: 'beginner',
    tags: ['health', 'doctor', 'PCP', 'find-physician'],
    coverImage: 'https://images.unsplash.com/photo-1537005081207-04f90e3ba640?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['health-1', 'health-4'],
    created_at: '2024-03-02T00:00:00Z',
  },

  // ─── FINANCE (5) ────────────────────────────────────────
  {
    id: 'finance-1',
    title: 'learn.articles.finance.1.title',
    category: 'finance',
    description: 'learn.articles.finance.1.description',
    content: 'learn.articles.finance.1.content',
    readTime: 7,
    difficulty: 'beginner',
    tags: ['finance', 'banking', 'account', 'debit-card'],
    coverImage: 'https://images.unsplash.com/photo-1557149289-0b6e90634e02?w=800&h=400&fit=crop&auto=format',
    featured: true,
    popular: true,
    relatedArticles: ['finance-2', 'finance-3'],
    created_at: '2024-03-05T00:00:00Z',
  },
  {
    id: 'finance-2',
    title: 'learn.articles.finance.2.title',
    category: 'finance',
    description: 'learn.articles.finance.2.description',
    content: 'learn.articles.finance.2.content',
    readTime: 8,
    difficulty: 'intermediate',
    tags: ['finance', 'credit', 'score', 'FICO'],
    coverImage: 'https://images.unsplash.com/photo-1656433031375-5042f5afe894?w=800&h=400&fit=crop&auto=format',
    popular: true,
    relatedArticles: ['finance-1', 'finance-5'],
    created_at: '2024-03-08T00:00:00Z',
  },
  {
    id: 'finance-3',
    title: 'learn.articles.finance.3.title',
    category: 'finance',
    description: 'learn.articles.finance.3.description',
    content: 'learn.articles.finance.3.content',
    readTime: 6,
    difficulty: 'beginner',
    tags: ['finance', 'budget', 'money', 'savings'],
    coverImage: 'https://images.unsplash.com/photo-1587466412525-87497b34fc88?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['finance-1', 'finance-4'],
    created_at: '2024-03-12T00:00:00Z',
  },
  {
    id: 'finance-4',
    title: 'learn.articles.finance.4.title',
    category: 'finance',
    description: 'learn.articles.finance.4.description',
    content: 'learn.articles.finance.4.content',
    readTime: 7,
    difficulty: 'beginner',
    tags: ['finance', 'remittance', 'transfer', 'international'],
    coverImage: 'https://images.unsplash.com/photo-1629581688635-5d88654e5bdd?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['finance-1', 'finance-3'],
    created_at: '2024-03-15T00:00:00Z',
  },
  {
    id: 'finance-5',
    title: 'learn.articles.finance.5.title',
    category: 'finance',
    description: 'learn.articles.finance.5.description',
    content: 'learn.articles.finance.5.content',
    readTime: 8,
    difficulty: 'intermediate',
    tags: ['finance', 'debt', 'credit-card', 'repayment'],
    coverImage: 'https://images.unsplash.com/photo-1661030420948-862787de0056?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['finance-2', 'finance-3'],
    created_at: '2024-03-18T00:00:00Z',
  },

  // ─── EDUCATION (5) ──────────────────────────────────────
  {
    id: 'education-1',
    title: 'learn.articles.education.1.title',
    category: 'education',
    description: 'learn.articles.education.1.description',
    content: 'learn.articles.education.1.content',
    readTime: 6,
    difficulty: 'beginner',
    tags: ['education', 'ESL', 'English', 'language'],
    coverImage: 'https://images.unsplash.com/photo-1703505841379-2f863b201212?w=800&h=400&fit=crop&auto=format',
    featured: true,
    popular: true,
    relatedArticles: ['education-2', 'education-3'],
    created_at: '2024-03-20T00:00:00Z',
  },
  {
    id: 'education-2',
    title: 'learn.articles.education.2.title',
    category: 'education',
    description: 'learn.articles.education.2.description',
    content: 'learn.articles.education.2.content',
    readTime: 7,
    difficulty: 'intermediate',
    tags: ['education', 'GED', 'high-school', 'diploma'],
    coverImage: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&h=400&fit=crop&auto=format',
    popular: true,
    relatedArticles: ['education-1', 'education-3'],
    created_at: '2024-03-22T00:00:00Z',
  },
  {
    id: 'education-3',
    title: 'learn.articles.education.3.title',
    category: 'education',
    description: 'learn.articles.education.3.description',
    content: 'learn.articles.education.3.content',
    readTime: 8,
    difficulty: 'intermediate',
    tags: ['education', 'scholarship', 'college', 'financial-aid'],
    coverImage: 'https://images.unsplash.com/photo-1682687221038-404670e01d4c?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['education-1', 'education-2'],
    created_at: '2024-03-25T00:00:00Z',
  },
  {
    id: 'education-4',
    title: 'learn.articles.education.4.title',
    category: 'education',
    description: 'learn.articles.education.4.description',
    content: 'learn.articles.education.4.content',
    readTime: 6,
    difficulty: 'beginner',
    tags: ['education', 'online', 'coursera', 'learning'],
    coverImage: 'https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['education-1', 'education-5'],
    created_at: '2024-03-28T00:00:00Z',
  },
  {
    id: 'education-5',
    title: 'learn.articles.education.5.title',
    category: 'education',
    description: 'learn.articles.education.5.description',
    content: 'learn.articles.education.5.content',
    readTime: 7,
    difficulty: 'intermediate',
    tags: ['education', 'trade-school', 'vocational', 'certification'],
    coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['education-1', 'education-4'],
    created_at: '2024-04-01T00:00:00Z',
  },

  // ─── SAFETY (5) ─────────────────────────────────────────
  {
    id: 'safety-1',
    title: 'learn.articles.safety.1.title',
    category: 'safety',
    description: 'learn.articles.safety.1.description',
    content: 'learn.articles.safety.1.content',
    readTime: 7,
    difficulty: 'beginner',
    tags: ['safety', 'scam', 'fraud', 'phishing'],
    coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop&auto=format',
    featured: true,
    popular: true,
    relatedArticles: ['safety-2', 'safety-5'],
    created_at: '2024-04-05T00:00:00Z',
  },
  {
    id: 'safety-2',
    title: 'learn.articles.safety.2.title',
    category: 'safety',
    description: 'learn.articles.safety.2.description',
    content: 'learn.articles.safety.2.content',
    readTime: 7,
    difficulty: 'beginner',
    tags: ['safety', 'domestic-violence', 'abuse', 'hotline'],
    coverImage: 'https://images.unsplash.com/photo-1569025690315-2b6f26e7b293?w=800&h=400&fit=crop&auto=format',
    popular: true,
    relatedArticles: ['safety-1', 'safety-4'],
    created_at: '2024-04-08T00:00:00Z',
  },
  {
    id: 'safety-3',
    title: 'learn.articles.safety.3.title',
    category: 'safety',
    description: 'learn.articles.safety.3.description',
    content: 'learn.articles.safety.3.content',
    readTime: 8,
    difficulty: 'intermediate',
    tags: ['safety', 'ICE', 'immigration', 'rights'],
    coverImage: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['safety-1', 'safety-4'],
    created_at: '2024-04-12T00:00:00Z',
  },
  {
    id: 'safety-4',
    title: 'learn.articles.safety.4.title',
    category: 'safety',
    description: 'learn.articles.safety.4.description',
    content: 'learn.articles.safety.4.content',
    readTime: 6,
    difficulty: 'beginner',
    tags: ['safety', 'emergency', 'plan', 'preparation'],
    coverImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['safety-2', 'safety-3'],
    created_at: '2024-04-15T00:00:00Z',
  },
  {
    id: 'safety-5',
    title: 'learn.articles.safety.5.title',
    category: 'safety',
    description: 'learn.articles.safety.5.description',
    content: 'learn.articles.safety.5.content',
    readTime: 6,
    difficulty: 'beginner',
    tags: ['safety', 'online', 'privacy', 'password'],
    coverImage: 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['safety-1', 'safety-4'],
    created_at: '2024-04-18T00:00:00Z',
  },

  // ─── COMMUNITY (5) ──────────────────────────────────────
  {
    id: 'community-1',
    title: 'learn.articles.community.1.title',
    category: 'community',
    description: 'learn.articles.community.1.description',
    content: 'learn.articles.community.1.content',
    readTime: 6,
    difficulty: 'beginner',
    tags: ['community', 'culture', 'adaptation', 'tips'],
    coverImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=400&fit=crop&auto=format',
    featured: true,
    popular: true,
    relatedArticles: ['community-2', 'community-3'],
    created_at: '2024-04-20T00:00:00Z',
  },
  {
    id: 'community-2',
    title: 'learn.articles.community.2.title',
    category: 'community',
    description: 'learn.articles.community.2.description',
    content: 'learn.articles.community.2.content',
    readTime: 7,
    difficulty: 'beginner',
    tags: ['community', 'meetup', 'groups', 'friends'],
    coverImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=400&fit=crop&auto=format',
    popular: true,
    relatedArticles: ['community-1', 'community-5'],
    created_at: '2024-04-22T00:00:00Z',
  },
  {
    id: 'community-3',
    title: 'learn.articles.community.3.title',
    category: 'community',
    description: 'learn.articles.community.3.description',
    content: 'learn.articles.community.3.content',
    readTime: 6,
    difficulty: 'beginner',
    tags: ['community', 'language', 'exchange', 'practice'],
    coverImage: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['community-1', 'community-2'],
    created_at: '2024-04-25T00:00:00Z',
  },
  {
    id: 'community-4',
    title: 'learn.articles.community.4.title',
    category: 'community',
    description: 'learn.articles.community.4.description',
    content: 'learn.articles.community.4.content',
    readTime: 6,
    difficulty: 'beginner',
    tags: ['community', 'faith', 'church', 'mosque'],
    coverImage: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['community-2', 'community-5'],
    created_at: '2024-04-28T00:00:00Z',
  },
  {
    id: 'community-5',
    title: 'learn.articles.community.5.title',
    category: 'community',
    description: 'learn.articles.community.5.description',
    content: 'learn.articles.community.5.content',
    readTime: 7,
    difficulty: 'beginner',
    tags: ['community', 'volunteer', 'give-back', 'nonprofit'],
    coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['community-2', 'community-4'],
    created_at: '2024-05-01T00:00:00Z',
  },

  // ─── WORK (5) ───────────────────────────────────────────
  {
    id: 'work-1',
    title: 'learn.articles.work.1.title',
    category: 'work',
    description: 'learn.articles.work.1.description',
    content: 'learn.articles.work.1.content',
    readTime: 7,
    difficulty: 'beginner',
    tags: ['work', 'gig', 'uber', 'doordash', 'freelance'],
    coverImage: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=400&fit=crop&auto=format',
    featured: true,
    popular: true,
    relatedArticles: ['work-2', 'work-3'],
    created_at: '2024-05-05T00:00:00Z',
  },
  {
    id: 'work-2',
    title: 'learn.articles.work.2.title',
    category: 'work',
    description: 'learn.articles.work.2.description',
    content: 'learn.articles.work.2.content',
    readTime: 8,
    difficulty: 'intermediate',
    tags: ['work', 'labor-law', 'FSLA', 'wages', 'overtime'],
    coverImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop&auto=format',
    popular: true,
    relatedArticles: ['work-1', 'work-3'],
    created_at: '2024-05-08T00:00:00Z',
  },
  {
    id: 'work-3',
    title: 'learn.articles.work.3.title',
    category: 'work',
    description: 'learn.articles.work.3.description',
    content: 'learn.articles.work.3.content',
    readTime: 7,
    difficulty: 'intermediate',
    tags: ['work', 'wage-theft', 'unpaid', 'recover'],
    coverImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c8f1?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['work-2', 'work-4'],
    created_at: '2024-05-12T00:00:00Z',
  },
  {
    id: 'work-4',
    title: 'learn.articles.work.4.title',
    category: 'work',
    description: 'learn.articles.work.4.description',
    content: 'learn.articles.work.4.content',
    readTime: 7,
    difficulty: 'intermediate',
    tags: ['work', 'union', 'collective', 'bargaining'],
    coverImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['work-2', 'work-3'],
    created_at: '2024-05-15T00:00:00Z',
  },
  {
    id: 'work-5',
    title: 'learn.articles.work.5.title',
    category: 'work',
    description: 'learn.articles.work.5.description',
    content: 'learn.articles.work.5.content',
    readTime: 8,
    difficulty: 'beginner',
    tags: ['work', 'authorization', 'EAD', 'OPT', 'CPT'],
    coverImage: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&h=400&fit=crop&auto=format',
    relatedArticles: ['work-1', 'work-2'],
    created_at: '2024-05-18T00:00:00Z',
  },
];

export const PRIORITY_OPTIONS = [
  { id: 'low', label: 'support.priority_low_label', description: 'support.priority_low_desc', color: '#64748B' },
  { id: 'medium', label: 'support.priority_medium_label', description: 'support.priority_medium_desc', color: '#F59E0B' },
  { id: 'high', label: 'support.priority_high_label', description: 'support.priority_high_desc', color: '#EF4444' },
  { id: 'urgent', label: 'support.priority_urgent_label', description: 'support.priority_urgent_desc', color: '#DC2626' },
] as const;
