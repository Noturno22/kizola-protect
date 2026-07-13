import {
  Calculator,
  Globe,
  Home,
  Scale,
  Briefcase,
  FileText,
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
};

// Default export for Expo Router (this file is not a route)
export default function _notARoute() { return null; }
