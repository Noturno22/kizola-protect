import {
  Calculator,
  Globe,
  Home,
  Scale,
  Briefcase,
  FileText,
  Heart,
  Wallet,
  GraduationCap,
  ShieldAlert,
  Users,
  BriefcaseBusiness,
} from 'lucide-react-native';

export const CATEGORY_CONFIG: Record<
  string,
  { icon: typeof FileText; color: string; key: string }
> = {
  tax: { icon: Calculator, color: '#8B5CF6', key: 'learn.category_tax' },
  immigration: {
    icon: Globe,
    color: '#10B981',
    key: 'learn.category_immigration',
  },
  housing: { icon: Home, color: '#F59E0B', key: 'learn.category_housing' },
  legal: { icon: Scale, color: '#3B82F6', key: 'learn.category_legal' },
  career: { icon: Briefcase, color: '#EC4899', key: 'learn.category_career' },
  health: { icon: Heart, color: '#EF4444', key: 'learn.category_health' },
  finance: { icon: Wallet, color: '#06B6D4', key: 'learn.category_finance' },
  education: {
    icon: GraduationCap,
    color: '#8B5CF6',
    key: 'learn.category_education',
  },
  safety: { icon: ShieldAlert, color: '#F97316', key: 'learn.category_safety' },
  community: { icon: Users, color: '#14B8A6', key: 'learn.category_community' },
  work: {
    icon: BriefcaseBusiness,
    color: '#6366F1',
    key: 'learn.category_work',
  },
};

// Default export for Expo Router (this file is not a route)
export default function _notARoute() { return null; }
