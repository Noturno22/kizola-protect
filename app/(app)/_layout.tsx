import { Tabs } from 'expo-router';
import {
  Home,
  Gift,
  MessageCircle,
  User,
  ClipboardList,
  BookOpen,
  LayoutDashboard,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';

export default function AppLayout() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopWidth: 1,
          borderTopColor: theme.cardBorderAlt,
          height: 84,
          paddingBottom: 24,
          paddingTop: 12,
          shadowColor: '#000',
          shadowOpacity: 0.10,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -6 },
          elevation: 12,
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t('dashboard.welcome') || 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="benefits"
        options={{
          title: t('profile.benefits') || 'Benefits',
          tabBarIcon: ({ color, size }) => <Gift size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: t('profile.myActivity') || 'Activity',
          tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: t('profile.learningCenter') || 'Learn',
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: t('profile.support') || 'Support',
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile.title') || 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      {/* Admin tab — visible only when the logged-in user is an admin */}
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
          // href: null hides the tab completely for non-admin users
          href: isAdmin ? '/(app)/admin/dashboard' : null,
        }}
      />
      {/* Hidden screens — not shown in tab bar */}
      <Tabs.Screen
        name="finance-support"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="housing-support"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          title: t('profile.myPlan') || 'Plans',
          href: null,
        }}
      />
      <Tabs.Screen
        name="plan-details"
        options={{
          title: t('profile.myPlan') || 'My Plan',
          href: null,
        }}
      />
      <Tabs.Screen
        name="checkout"
        options={{
          title: 'Checkout',
          href: null,
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: t('documents.title') || 'Documents',
          href: null,
        }}
      />
    </Tabs>
  );
}
