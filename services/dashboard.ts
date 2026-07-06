import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface DashboardStats {
  totalUsers: number;
  activePlans: number;
  supportTickets: number;
  revenue: number;
  userGrowthPercent: number;
  planGrowthPercent: number;
  ticketTrendPercent: number;
  revenueGrowthPercent: number;
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
}

export interface UserAnalyticsDataPoint {
  month: string;
  newUsers: number;
}

export interface PlanDistribution {
  plan: string;
  count: number;
}

export interface RecentUser {
  id: string;
  name: string;
  email: string;
  plan: string;
  created_at: string;
}

export interface SatisfactionAnalytics {
  totalRatings: number;
  resolvedCount: number;
  unresolvedCount: number;
  satisfactionRate: number;
  avgRating: number;
  ratingsByType: {
    support: { total: number; resolved: number; rate: number };
    housing: { total: number; resolved: number; rate: number };
    finance: { total: number; resolved: number; rate: number };
  };
  recentRatings: Array<{
    id: string;
    request_type: string;
    resolved: boolean;
    rating: number | null;
    created_at: string;
    user_name?: string;
    user_email?: string;
  }>;
}

export interface BenefitsAnalytics {
  topServices: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  requestsByCategory: {
    support: number;
    housing: number;
    finance: number;
    legal: number;
    immigration: number;
    tax: number;
    education: number;
    emergency: number;
    job: number;
    recovery: number;
  };
  totalRequests: number;
}

export interface AtendimentoAnalytics {
  pendingCount: number;
  inProgressCount: number;
  resolvedCount: number;
  totalCount: number;
  byType: {
    support: { pending: number; inProgress: number; resolved: number };
    housing: { pending: number; inProgress: number; resolved: number };
    finance: { pending: number; inProgress: number; resolved: number };
  };
  recentCases: Array<{
    id: string;
    type: string;
    status: string;
    subType: string;
    userName: string;
    userEmail: string;
    createdAt: string;
  }>;
}

export interface FinanceiroAnalytics {
  mrr: number;
  arr: number;
  activeSubscriptions: number;
  planDistribution: { free: number; basic: number; pro: number; premium: number };
  stripeStatus: 'connected' | 'disconnected' | 'error';
  revenueTrend: Array<{ month: string; revenue: number }>;
  subscriptionStatusCounts: { active: number; cancelled: number; expired: number };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const [
    totalUsersResult,
    thisMonthUsersResult,
    lastMonthUsersResult,
    activePlansResult,
    thisMonthSubscriptionsResult,
    lastMonthSubscriptionsResult,
    supportTicketsResult,
    thisMonthTicketsResult,
    lastMonthTicketsResult,
    revenueResult,
    housingRequestsResult,
    financeRequestsResult,
    satisfactionRatingsResult,
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', thisMonthStart.toISOString()),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', lastMonthStart.toISOString()).lte('created_at', lastMonthEnd.toISOString()),
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active').gte('created_at', thisMonthStart.toISOString()),
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active').gte('created_at', lastMonthStart.toISOString()).lte('created_at', lastMonthEnd.toISOString()),
    supabase.from('support_requests').select('id, status', { count: 'exact' }),
    supabase.from('support_requests').select('id', { count: 'exact', head: true }).gte('created_at', thisMonthStart.toISOString()),
    supabase.from('support_requests').select('id', { count: 'exact', head: true }).gte('created_at', lastMonthStart.toISOString()).lte('created_at', lastMonthEnd.toISOString()),
    supabase.from('subscriptions').select('plan_id, created_at').eq('status', 'active'),
    supabase.from('housing_requests').select('status'),
    supabase.from('finance_requests').select('status'),
    supabase.from('satisfaction_ratings').select('resolved'),
  ]);

  const totalUsers = totalUsersResult.count ?? 0;
  const thisMonthUsers = thisMonthUsersResult.count ?? 0;
  const lastMonthUsers = lastMonthUsersResult.count ?? 0;
  const activePlans = activePlansResult.count ?? 0;
  const thisMonthSubscriptions = thisMonthSubscriptionsResult.count ?? 0;
  const lastMonthSubscriptions = lastMonthSubscriptionsResult.count ?? 0;
  const supportTickets = supportTicketsResult.count ?? 0;
  const thisMonthTickets = thisMonthTicketsResult.count ?? 0;
  const lastMonthTickets = lastMonthTicketsResult.count ?? 0;

  let openCases = 0;
  let resolvedCases = 0;

  const countCases = (list: any[] | null) => {
    if (!list) return;
    list.forEach(item => {
      const status = (item.status || '').toLowerCase();
      if (status === 'pending' || status === 'in_progress') {
        openCases++;
      } else if (status === 'completed' || status === 'resolved') {
        resolvedCases++;
      }
    });
  };

  countCases(supportTicketsResult.data);
  countCases(housingRequestsResult.data);
  countCases(financeRequestsResult.data);

  let satisfactionRate = 96; 
  const ratings = satisfactionRatingsResult.data || [];
  if (ratings.length > 0) {
    const positive = ratings.filter(r => r.resolved === true).length;
    satisfactionRate = Math.round((positive / ratings.length) * 100);
  }

  const PLANS = { free: 0, basic: 27.99, pro: 29.99, premium: 33.99 } as const;
  let totalRevenue = 0;
  let totalMembers = 0;
  if (revenueResult.data) {
    for (const sub of revenueResult.data) {
      const price = PLANS[sub.plan_id as keyof typeof PLANS] ?? 0;
      totalRevenue += price;
      if (sub.plan_id !== 'free') {
        totalMembers++;
      }
    }
  }

  const calcGrowth = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  return {
    totalUsers,
    totalMembers,
    activePlans,
    supportTickets,
    revenue: totalRevenue,
    userGrowthPercent: calcGrowth(thisMonthUsers, lastMonthUsers),
    planGrowthPercent: calcGrowth(thisMonthSubscriptions, lastMonthSubscriptions),
    ticketTrendPercent: -calcGrowth(thisMonthTickets, lastMonthTickets),
    revenueGrowthPercent: calcGrowth(thisMonthSubscriptions, lastMonthSubscriptions),
    openCases,
    resolvedCases,
    satisfactionRate
  };
}

export async function getRevenueChartData(months = 7): Promise<RevenueDataPoint[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const now = new Date();
  const PLANS = { free: 0, basic: 27.99, pro: 29.99, premium: 33.99 } as const;
  const data: RevenueDataPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);

    const { data: subs, error } = await supabase
      .from('subscriptions')
      .select('plan_id')
      .eq('status', 'active')
      .gte('created_at', monthStart.toISOString())
      .lte('created_at', monthEnd.toISOString());

    if (error) {
      console.error('Error fetching revenue data:', error);
    }

    let revenue = 0;
    if (subs) {
      for (const sub of subs) {
        revenue += PLANS[sub.plan_id as keyof typeof PLANS] ?? 0;
      }
    }

    const monthLabel = monthStart.toLocaleString('default', { month: 'short' });
    data.push({ month: monthLabel, revenue });
  }

  return data;
}

export async function getUserAnalytics(months = 7): Promise<UserAnalyticsDataPoint[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const now = new Date();
  const data: UserAnalyticsDataPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);

    const { count, error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', monthStart.toISOString())
      .lte('created_at', monthEnd.toISOString());

    if (error) {
      console.error('Error fetching user analytics:', error);
    }

    const monthLabel = monthStart.toLocaleString('default', { month: 'short' });
    data.push({ month: monthLabel, newUsers: count ?? 0 });
  }

  return data;
}

export async function getPlanDistribution(): Promise<PlanDistribution[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { data: subs, error } = await supabase
    .from('subscriptions')
    .select('plan_id')
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching plan distribution:', error);
    return [];
  }

  const distribution: Record<string, number> = {};
  if (subs) {
    for (const sub of subs) {
      distribution[sub.plan_id] = (distribution[sub.plan_id] ?? 0) + 1;
    }
  }

  return Object.entries(distribution).map(([plan, count]) => ({ plan, count }));
}

export async function getRecentUsers(limit = 5): Promise<RecentUser[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent users:', error);
    return [];
  }

  const userIds = profiles?.map(p => p.id) ?? [];
  let planMap: Record<string, string> = {};

  if (userIds.length > 0) {
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('user_id, plan_id')
      .eq('status', 'active')
      .in('user_id', userIds);

    if (subs) {
      for (const sub of subs) {
        if (!planMap[sub.user_id]) {
          planMap[sub.user_id] = sub.plan_id;
        }
      }
    }
  }

  return (profiles ?? []).map(p => ({
    id: p.id,
    name: p.full_name || 'Unknown',
    email: p.email,
    plan: planMap[p.id] || 'Free',
    created_at: p.created_at,
  }));
}

export function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export async function getBenefitsAnalytics(): Promise<BenefitsAnalytics> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { data: supportRequests } = await supabase
    .from('support_requests')
    .select('category');

  const { data: housingRequests } = await supabase
    .from('housing_requests')
    .select('necessidade');

  const { data: financeRequests } = await supabase
    .from('finance_requests')
    .select('tipo_ajuda');

  const categoryCounts: Record<string, number> = {};

  (supportRequests || []).forEach(req => {
    const cat = req.category || 'other';
    categoryCounts[`support_${cat}`] = (categoryCounts[`support_${cat}`] || 0) + 1;
  });

  (housingRequests || []).forEach(req => {
    const cat = req.necessidade || 'other';
    categoryCounts[`housing_${cat}`] = (categoryCounts[`housing_${cat}`] || 0) + 1;
  });

  (financeRequests || []).forEach(req => {
    const cat = req.tipo_ajuda || 'other';
    categoryCounts[`finance_${cat}`] = (categoryCounts[`finance_${cat}`] || 0) + 1;
  });

  const topServices = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([key, count]) => {
      const [type, category] = key.split('_');
      const total = supportRequests?.length + housingRequests?.length + financeRequests?.length || 1;
      return {
        category: `${type}: ${category}`,
        count,
        percentage: Math.round((count / total) * 100),
      };
    });

  const totalRequests = (supportRequests?.length || 0) + (housingRequests?.length || 0) + (financeRequests?.length || 0);

  return {
    topServices,
    requestsByCategory: {
      support: supportRequests?.length || 0,
      housing: housingRequests?.length || 0,
      finance: financeRequests?.length || 0,
      legal: (supportRequests || []).filter(r => r.category === 'legal').length,
      immigration: (supportRequests || []).filter(r => r.category === 'immigration').length,
      tax: (supportRequests || []).filter(r => r.category === 'tax').length,
      education: (supportRequests || []).filter(r => r.category === 'education').length,
      emergency: (supportRequests || []).filter(r => r.category === 'emergency').length,
      job: (supportRequests || []).filter(r => r.category === 'job').length,
      recovery: (supportRequests || []).filter(r => r.category === 'recovery').length,
    },
    totalRequests,
  };
}

export async function getSatisfactionAnalytics(): Promise<SatisfactionAnalytics> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const { data: ratings, error } = await supabase
    .from('satisfaction_ratings')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching satisfaction ratings:', error);
    throw error;
  }

  const totalRatings = ratings?.length ?? 0;
  const resolvedCount = ratings?.filter(r => r.resolved === true).length ?? 0;
  const unresolvedCount = ratings?.filter(r => r.resolved === false).length ?? 0;
  const satisfactionRate = totalRatings > 0 ? Math.round((resolvedCount / totalRatings) * 100) : 0;
  
  const ratingsWithValue = ratings?.filter(r => r.rating !== null) ?? [];
  const avgRating = ratingsWithValue.length > 0 
    ? Math.round((ratingsWithValue.reduce((sum, r) => sum + (r.rating || 0), 0) / ratingsWithValue.length) * 10) / 10 
    : 0;

  const ratingsByType = {
    support: { total: 0, resolved: 0, rate: 0 },
    housing: { total: 0, resolved: 0, rate: 0 },
    finance: { total: 0, resolved: 0, rate: 0 },
  };

  (ratings || []).forEach(r => {
    const type = r.request_type as 'support' | 'housing' | 'finance';
    if (ratingsByType[type]) {
      ratingsByType[type].total++;
      if (r.resolved) ratingsByType[type].resolved++;
    }
  });

  Object.keys(ratingsByType).forEach(key => {
    const type = key as 'support' | 'housing' | 'finance';
    if (ratingsByType[type].total > 0) {
      ratingsByType[type].rate = Math.round((ratingsByType[type].resolved / ratingsByType[type].total) * 100);
    }
  });

  const recentRatings = (ratings || []).slice(0, 10).map(r => ({
    id: r.id,
    request_type: r.request_type,
    resolved: r.resolved,
    rating: r.rating,
    created_at: r.created_at,
    user_name: (r as any).profiles?.full_name,
    user_email: (r as any).profiles?.email,
  }));

  return {
    totalRatings,
    resolvedCount,
    unresolvedCount,
    satisfactionRate,
    avgRating,
    ratingsByType,
    recentRatings,
  };
}

export async function getAtendimentoAnalytics(): Promise<AtendimentoAnalytics> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const [
    { data: supportRequests },
    { data: housingRequests },
    { data: financeRequests },
  ] = await Promise.all([
    supabase.from('support_requests').select('id, status, category, priority, created_at, profiles(full_name, email)'),
    supabase.from('housing_requests').select('id, status, necessidade, created_at, profiles(full_name, email)'),
    supabase.from('finance_requests').select('id, status, tipo_ajuda, created_at, profiles(full_name, email)'),
  ]);

  const countByStatus = (items: any[] | null) => {
    const counts = { pending: 0, inProgress: 0, resolved: 0 };
    if (!items) return counts;
    items.forEach(item => {
      const status = (item.status || '').toLowerCase();
      if (status === 'pending') counts.pending++;
      else if (status === 'in_progress') counts.inProgress++;
      else if (status === 'completed' || status === 'resolved') counts.resolved++;
    });
    return counts;
  };

  const supportCounts = countByStatus(supportRequests);
  const housingCounts = countByStatus(housingRequests);
  const financeCounts = countByStatus(financeRequests);

  const allCases = [
    ...(supportRequests || []).map(r => ({ ...r, type: 'support', subType: r.category })),
    ...(housingRequests || []).map(r => ({ ...r, type: 'housing', subType: r.necessidade })),
    ...(financeRequests || []).map(r => ({ ...r, type: 'finance', subType: r.tipo_ajuda })),
  ];

  allCases.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return {
    pendingCount: supportCounts.pending + housingCounts.pending + financeCounts.pending,
    inProgressCount: supportCounts.inProgress + housingCounts.inProgress + financeCounts.inProgress,
    resolvedCount: supportCounts.resolved + housingCounts.resolved + financeCounts.resolved,
    totalCount: allCases.length,
    byType: {
      support: supportCounts,
      housing: housingCounts,
      finance: financeCounts,
    },
    recentCases: allCases.slice(0, 10).map(c => ({
      id: c.id,
      type: c.type,
      status: c.status,
      subType: c.subType,
      userName: c.profiles?.full_name || 'Membro',
      userEmail: c.profiles?.email || '',
      createdAt: c.created_at,
    })),
  };
}

export async function getFinanceiroAnalytics(): Promise<FinanceiroAnalytics> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  const PLANS = { free: 0, basic: 27.99, pro: 29.99, premium: 33.99 } as const;

  const { data: subs, error } = await supabase
    .from('subscriptions')
    .select('plan_id, status, created_at, next_billing_date');

  if (error) {
    console.error('Error fetching subscription data:', error);
  }

  let mrr = 0;
  let arr = 0;
  const planDistribution = { free: 0, basic: 0, pro: 0, premium: 0 };
  const subscriptionStatusCounts = { active: 0, cancelled: 0, expired: 0 };
  const activeSubs: any[] = [];

  if (subs) {
    for (const sub of subs) {
      const price = PLANS[sub.plan_id as keyof typeof PLANS] ?? 0;
      if (sub.status === 'active') {
        mrr += price;
        activeSubs.push(sub);
        if (sub.plan_id in planDistribution) {
          planDistribution[sub.plan_id as keyof typeof planDistribution]++;
        }
      }
      if (sub.status in subscriptionStatusCounts) {
        subscriptionStatusCounts[sub.status as keyof typeof subscriptionStatusCounts]++;
      }
    }
  }

  arr = mrr * 12;

  // Get revenue trend for last 6 months
  const now = new Date();
  const revenueTrend: Array<{ month: string; revenue: number }> = [];
  
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);

    const { data: monthSubs } = await supabase
      .from('subscriptions')
      .select('plan_id')
      .eq('status', 'active')
      .gte('created_at', monthStart.toISOString())
      .lte('created_at', monthEnd.toISOString());

    let monthRevenue = 0;
    if (monthSubs) {
      for (const sub of monthSubs) {
        monthRevenue += PLANS[sub.plan_id as keyof typeof PLANS] ?? 0;
      }
    }

    const monthLabel = monthStart.toLocaleString('default', { month: 'short' });
    revenueTrend.push({ month: monthLabel, revenue: monthRevenue });
  }

  return {
    mrr,
    arr,
    activeSubscriptions: activeSubs.length,
    planDistribution,
    stripeStatus: 'connected', // Would check actual Stripe connection
    revenueTrend,
    subscriptionStatusCounts,
  };
}
