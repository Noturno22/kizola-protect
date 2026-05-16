import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { 
  Users, 
  ShieldCheck, 
  MessageSquare, 
  TrendingUp, 
  ChevronRight,
  Bell,
  Settings,
  LayoutDashboard,
  LogOut,
  ArrowUpRight
} from 'lucide-react-native';
import { AdminStatCard } from '@/components/AdminStatCard';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

function AdminDashboard() {
  const { theme, isDark } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const stats = [
    { title: 'Total Users', value: '1,284', icon: Users, color: '#3B82F6', trend: 'up', trendValue: '+12%' },
    { title: 'Active Plans', value: '856', icon: ShieldCheck, color: '#10B981', trend: 'up', trendValue: '+5%' },
    { title: 'Support Tickets', value: '24', icon: MessageSquare, color: '#F59E0B', trend: 'down', trendValue: '-3%' },
    { title: 'Revenue', value: '$12,450', icon: TrendingUp, color: '#8B5CF6', trend: 'up', trendValue: '+18%' },
  ];

  const recentUsers = [
    { id: '1', name: 'Marco Aurélio', email: 'marco.a@email.com', plan: 'Pro', date: '2 mins ago' },
    { id: '2', name: 'Sarah Connor', email: 'sarah.c@email.com', plan: 'Premium', date: '15 mins ago' },
    { id: '3', name: 'John Doe', email: 'john.d@email.com', plan: 'Free', date: '1 hour ago' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>Admin Panel</Text>
            <Text style={[styles.name, { color: theme.text }]}>Dashboard</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.surfaceElevated }]}>
              <Bell size={20} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => signOut()}
              style={[styles.iconButton, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}
            >
              <LogOut size={20} color={theme.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <AdminStatCard 
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              trend={stat.trend as any}
              trendValue={stat.trendValue}
              delay={index * 100}
            />
          ))}
        </View>

        {/* Revenue Overview (Visual Placeholder) */}
        <View 
          style={[styles.chartCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.cardBorder }]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Revenue Overview</Text>
            <TouchableOpacity>
              <Text style={[styles.seeMore, { color: theme.accent }]}>Last 30 Days</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.chartPlaceholder}>
            <LinearGradient
              colors={[theme.accent + '30', 'transparent']}
              style={styles.chartGradient}
            />
            {/* Simple bars to simulate a chart */}
            <View style={styles.barsContainer}>
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <View key={i} style={[styles.bar, { height: h, backgroundColor: theme.accent }]} />
              ))}
            </View>
          </View>
        </View>

        {/* Recent Users List */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Users</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/admin/users')}>
            <Text style={[styles.seeAll, { color: theme.accent }]}>See all</Text>
          </TouchableOpacity>
        </View>

        {recentUsers.map((u) => (
          <TouchableOpacity
            key={u.id}
            style={[styles.userCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
          >
            <View style={styles.userInfo}>
              <View style={[styles.avatar, { backgroundColor: theme.accent + '20' }]}>
                <Text style={[styles.avatarText, { color: theme.accent }]}>{u.name[0]}</Text>
              </View>
              <View>
                <Text style={[styles.userName, { color: theme.text }]}>{u.name}</Text>
                <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{u.email}</Text>
              </View>
            </View>
            <View style={styles.userMeta}>
              <View style={[styles.planBadge, { backgroundColor: u.plan === 'Premium' ? theme.accentPurple + '20' : theme.accentBlue + '20' }]}>
                <Text style={[styles.planText, { color: u.plan === 'Premium' ? theme.accentPurple : theme.accentBlue }]}>{u.plan}</Text>
              </View>
              <Text style={[styles.userDate, { color: theme.textMuted }]}>{u.date}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Admin Bottom Navigation (Simplified) */}
      <View style={[styles.bottomNav, { backgroundColor: theme.surface, borderTopColor: theme.cardBorder }]}>
        <TouchableOpacity style={styles.navItem}>
          <LayoutDashboard size={24} color={theme.accent} />
          <Text style={[styles.navText, { color: theme.accent }]}>Panel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/(app)/admin/users')}
        >
          <Users size={24} color={theme.textSecondary} />
          <Text style={[styles.navText, { color: theme.textSecondary }]}>Users</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/(app)/admin/support')}
        >
          <MessageSquare size={24} color={theme.textSecondary} />
          <Text style={[styles.navText, { color: theme.textSecondary }]}>Support</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/dashboard')}
        >
          <ArrowUpRight size={24} color={theme.textSecondary} />
          <Text style={[styles.navText, { color: theme.textSecondary }]}>Exit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  name: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  chartCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 32,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeMore: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartPlaceholder: {
    height: 120,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderRadius: 12,
  },
  chartGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    height: '100%',
  },
  bar: {
    width: (width - 120) / 7,
    borderRadius: 6,
    opacity: 0.8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 13,
  },
  userMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  planBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  planText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  userDate: {
    fontSize: 11,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 20,
    borderTopWidth: 1,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
export default AdminDashboard;
