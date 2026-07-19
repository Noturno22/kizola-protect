export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  category: 'emergency' | 'immigration' | 'legal' | 'safety';
  icon: string;
  available24h: boolean;
  description?: string;
}

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: '911',
    name: 'Emergency (911)',
    phone: '911',
    category: 'emergency',
    icon: 'Phone',
    available24h: true,
    description: 'Police, Fire, Medical emergencies',
  },
  {
    id: '211',
    name: '211 Helpline',
    phone: '211',
    category: 'emergency',
    icon: 'Info',
    available24h: true,
    description: 'Local social services and resources',
  },
  {
    id: 'ice-hotline',
    name: 'ICE Detention Hotline',
    phone: '1-888-351-4024',
    category: 'immigration',
    icon: 'Globe',
    available24h: true,
    description: 'Report immigration detention or request info',
  },
  {
    id: 'uscis',
    name: 'USCIS Contact Center',
    phone: '1-800-375-5283',
    category: 'immigration',
    icon: 'Globe',
    available24h: false,
    description: 'US Citizenship and Immigration Services',
  },
  {
    id: 'nlada',
    name: 'NLADA Legal Aid',
    phone: '1-202-452-8830',
    category: 'legal',
    icon: 'Scale',
    available24h: false,
    description: 'National Legal Aid and Defender Association',
  },
  {
    id: 'dv-hotline',
    name: 'Domestic Violence Hotline',
    phone: '1-800-799-7233',
    category: 'safety',
    icon: 'Shield',
    available24h: true,
    description: 'National Domestic Violence Hotline',
  },
  {
    id: 'suicide-hotline',
    name: 'Suicide & Crisis Lifeline',
    phone: '988',
    category: 'safety',
    icon: 'Heart',
    available24h: true,
    description: '24/7 crisis support',
  },
  {
    id: 'consulate-mx',
    name: 'Consulate of Mexico',
    phone: '1-213-365-9251',
    category: 'immigration',
    icon: 'Building',
    available24h: false,
    description: 'Mexican consulate services',
  },
  {
    id: 'consulate-gt',
    name: 'Consulate of Guatemala',
    phone: '1-213-365-9251',
    category: 'immigration',
    icon: 'Building',
    available24h: false,
    description: 'Guatemalan consulate services',
  },
];
