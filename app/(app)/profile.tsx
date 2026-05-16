import { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput, ActivityIndicator, Share, Platform } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import {
  User,
  Mail,
  Shield,
  CreditCard,
  LogOut,
  ChevronRight,
  Edit3,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  Phone,
  FileText,
  Bell,
  Bookmark,
  Share2,
  Users,
  Trash2,
  Plus,
  Globe,
  LayoutDashboard,
  Camera
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { useTheme, Theme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { PLANS, supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEMO_MODE_KEY = '@kizola_demo_user';
const BENEFICIARIES_KEY_PREFIX = '@kizola_beneficiaries:';

type BeneficiaryRelationship = 'Filho' | 'Mulher' | 'Outro';
type Beneficiary = {
  id: string;
  relationship: BeneficiaryRelationship;
  fullName: string;
  document: string;
};

function getBeneficiariesStorageKey(userId: string) {
  return `${BENEFICIARIES_KEY_PREFIX}${userId}`;
}

function maskDocument(value: string) {
  const clean = (value || '').replace(/\s+/g, '');
  if (clean.length <= 4) return clean;
  return `${'*'.repeat(Math.min(8, clean.length - 4))}${clean.slice(-4)}`;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Profile() {
  const router = useRouter();
  const { user, signOut, isDemoMode, updateAvatar } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);


  const userIdForStorage = useMemo(() => (user?.id ? String(user.id) : 'demo'), [user?.id]);
  const beneficiariesStorageKey = useMemo(() => getBeneficiariesStorageKey(userIdForStorage), [userIdForStorage]);

  // Edit profile state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Beneficiaries state
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [beneficiaryModalVisible, setBeneficiaryModalVisible] = useState(false);
  const [beneficiarySaving, setBeneficiarySaving] = useState(false);
  const [beneficiaryEditingId, setBeneficiaryEditingId] = useState<string | null>(null);
  const [beneficiaryRelationship, setBeneficiaryRelationship] = useState<BeneficiaryRelationship>('Filho');
  const [beneficiaryFullName, setBeneficiaryFullName] = useState('');
  const [beneficiaryDocument, setBeneficiaryDocument] = useState('');

  // Real subscription data from database
  const [subscriptionData, setSubscriptionData] = useState<{
    start_date: string | null;
    next_billing_date: string | null;
    status: string;
  } | null>(null);
  const [beneficiariesLoading, setBeneficiariesLoading] = useState(false);


  const planInfo = user?.plan && user.plan !== 'none' ? PLANS[user.plan as keyof typeof PLANS] : null;

  const loadBeneficiaries = useCallback(async () => {
    setBeneficiariesLoading(true);
    try {
      // Try Supabase first
      if (!isDemoMode && isSupabaseConfigured() && user?.id) {
        const { data, error } = await supabase
          .from('beneficiaries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (!error && data) {
          const mapped: Beneficiary[] = data.map((b: any) => ({
            id: b.id,
            relationship: b.relationship,
            fullName: b.full_name,
            document: b.document,
          }));
          setBeneficiaries(mapped);
          setBeneficiariesLoading(false);
          return;
        }
      }

      // Fallback to AsyncStorage (demo mode)
      const raw = await AsyncStorage.getItem(beneficiariesStorageKey);
      if (!raw) {
        setBeneficiaries([]);
        return;
      }
      const parsed = JSON.parse(raw) as Beneficiary[];
      if (!Array.isArray(parsed)) {
        setBeneficiaries([]);
        return;
      }
      setBeneficiaries(parsed);
    } catch {
      setBeneficiaries([]);
    } finally {
      setBeneficiariesLoading(false);
    }
  }, [beneficiariesStorageKey, isDemoMode, user?.id]);

  useEffect(() => {
    loadBeneficiaries();
  }, [loadBeneficiaries]);

  // Fetch real subscription data from database
  useEffect(() => {
    const fetchSubscription = async () => {
      if (isDemoMode || !isSupabaseConfigured() || !user?.id) return;
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('start_date, next_billing_date, status')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          setSubscriptionData(data);
        }
      } catch (e) {
        console.error('Error fetching subscription:', e);
      }
    };
    fetchSubscription();
  }, [user?.id, isDemoMode]);

  const persistBeneficiaries = useCallback(
    async (next: Beneficiary[]) => {
      await AsyncStorage.setItem(beneficiariesStorageKey, JSON.stringify(next));
      setBeneficiaries(next);
    },
    [beneficiariesStorageKey]
  );

  const openAddBeneficiary = useCallback(() => {
    setBeneficiaryEditingId(null);
    setBeneficiaryRelationship('Filho');
    setBeneficiaryFullName('');
    setBeneficiaryDocument('');
    setBeneficiaryModalVisible(true);
  }, []);

  const openEditBeneficiary = useCallback((b: Beneficiary) => {
    setBeneficiaryEditingId(b.id);
    setBeneficiaryRelationship(b.relationship);
    setBeneficiaryFullName(b.fullName);
    setBeneficiaryDocument(b.document);
    setBeneficiaryModalVisible(true);
  }, []);

  const handleSaveBeneficiary = useCallback(async () => {
    const fullName = beneficiaryFullName.trim();
    const document = beneficiaryDocument.trim();

    if (!fullName) {
      Alert.alert('Erro', 'Informe o nome do beneficiário.');
      return;
    }

    if (!document) {
      Alert.alert('Erro', 'Informe o documento do beneficiário.');
      return;
    }

    setBeneficiarySaving(true);
    try {
      const now = Date.now().toString();
      const next: Beneficiary[] =
        beneficiaryEditingId == null
          ? [
            ...beneficiaries,
            {
              id: now,
              relationship: beneficiaryRelationship,
              fullName,
              document,
            },
          ]
          : beneficiaries.map((b) =>
            b.id === beneficiaryEditingId
              ? { ...b, relationship: beneficiaryRelationship, fullName, document }
              : b
          );

      await persistBeneficiaries(next);
      setBeneficiaryModalVisible(false);
    } catch (e: any) {
      Alert.alert('Erro', e?.message || 'Falha ao salvar beneficiário.');
    } finally {
      setBeneficiarySaving(false);
    }
  }, [
    beneficiaryDocument,
    beneficiaryEditingId,
    beneficiaryFullName,
    beneficiaryRelationship,
    beneficiaries,
    persistBeneficiaries,
  ]);

  const handleDeleteBeneficiary = useCallback(
    (b: Beneficiary) => {
      Alert.alert('Remover', `Remover "${b.fullName}"?`, [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              const next = beneficiaries.filter((x) => x.id !== b.id);
              await persistBeneficiaries(next);
            } catch (e: any) {
              Alert.alert('Erro', e?.message || 'Falha ao remover beneficiário.');
            }
          },
        },
      ]);
    },
    [beneficiaries, persistBeneficiaries]
  );

  const handleShareAffiliateLink = useCallback(async () => {
    try {
      const ref = user?.id ? String(user.id) : 'demo';
      const url = Linking.createURL('/', { queryParams: { ref } });
      const message = `Conheça a Kizola Protect. Use o meu link: ${url}`;

      await Share.share({
        message,
        url,
        title: 'Kizola Protect',
      });
    } catch (e: any) {
      Alert.alert('Erro', e?.message || 'Não foi possível partilhar o link.');
    }
  }, [user?.id]);

const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatarLoading(true);
      try {
        const uri = result.assets[0].uri;
        await updateAvatar(uri);
        Alert.alert('Success', 'Profile picture updated');
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to update avatar');
      } finally {
        setAvatarLoading(false);
      }
    }
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      Alert.alert('Error', 'Name and email are required');
      return;
    }

    setLoading(true);
    try {
      if (isDemoMode) {
        const demoUser = {
          ...user,
          name: editName.trim(),
          email: editEmail.trim(),
          phone: editPhone.trim(),
        };
        await AsyncStorage.setItem(DEMO_MODE_KEY, JSON.stringify(demoUser));
      } else if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: editName.trim(),
            email: editEmail.trim(),
            phone: editPhone.trim(),
          })
          .eq('id', user?.id);

        if (error) throw error;
      }

      Alert.alert('Success', 'Profile updated successfully');
      setEditModalVisible(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (isDemoMode) {
        Alert.alert('Success', 'Password updated successfully (Demo Mode)');
      } else if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) throw error;
        Alert.alert('Success', 'Password updated successfully');
      }

      setPasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    ...(user?.role === 'admin' ? [{
      icon: LayoutDashboard,
      title: 'Admin Panel',
      subtitle: 'System management and stats',
      onPress: () => router.push('/(app)/admin/dashboard'),
      color: theme.accent,
    }] : []),
    {
      icon: CreditCard,
      title: t('profile.myPlan'),
      subtitle: planInfo?.name || t('profile.noActivePlan') || 'No active plan',
      onPress: () => router.push('/plan-details'),
      color: theme.primary,
    },
    {
      icon: Share2,
      title: t('profile.share'),
      subtitle: t('profile.shareSubtitle') || 'Envie o link da plataforma com o seu código',
      onPress: handleShareAffiliateLink,
      color: theme.accentBlue,
    },
    {
      icon: Shield,
      title: t('profile.benefits'),
      subtitle: t('profile.benefitsSubtitle') || 'View your included services',
      onPress: () => router.push('/benefits'),
      color: theme.secondary,
    },
    {
      icon: FileText,
      title: t('profile.myActivity'),
      subtitle: t('profile.activitySubtitle') || 'View your support requests',
      onPress: () => router.push('/activity'),
      color: theme.accentBlue,
    },
    {
      icon: Bookmark,
      title: t('profile.learningCenter'),
      subtitle: t('profile.learningSubtitle') || 'Educational resources',
      onPress: () => router.push('/learn'),
      color: theme.accentPurple,
    },
    {
      icon: Edit3,
      title: t('profile.editProfile'),
      subtitle: t('profile.editProfileSubtitle') || 'Update your personal information',
      onPress: () => {
        setEditName(user?.name || '');
        setEditEmail(user?.email || '');
        setEditPhone(user?.phone || '');
        setEditModalVisible(true);
      },
      color: theme.warning,
    },
    {
      icon: Lock,
      title: t('profile.changePassword'),
      subtitle: t('profile.changePasswordSubtitle') || 'Update your security settings',
      onPress: () => setPasswordModalVisible(true),
      color: theme.error,
    },
    {
      icon: Globe,
      title: t('profile.language'),
      subtitle: i18n.language === 'pt' ? 'Português' : i18n.language === 'en' ? 'English' : i18n.language === 'fr' ? 'Français' : 'Español',
      onPress: () => setLanguageModalVisible(true),
      color: theme.accentBlue,
    },
  ];


  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <LinearGradient colors={theme.headerGradient} style={styles.header}>
          <Text style={styles.headerTitle}>{t('profile.title')}</Text>
        </LinearGradient>


        {/* Profile Card */}
        <View style={styles.profileCardContainer}>
          <View style={styles.profileCard}>
            <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage} activeOpacity={0.8}>
              {avatarLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : user?.avatar_url ? (
                <Image 
                  source={{ uri: user.avatar_url }} 
                  style={styles.avatarImage} 
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              )}
              <View style={styles.avatarEditBadge}>
                <Camera size={12} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <View style={styles.profileInfo}>
              {user?.name && <Text style={styles.userName}>{user.name}</Text>}
              {user?.email && (
                <View style={styles.emailContainer}>
                  <Mail size={14} color={theme.textMuted} />
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
              )}
              {user?.phone && (
                <View style={styles.emailContainer}>
                  <Phone size={14} color={theme.textMuted} />
                  <Text style={styles.userEmail}>{user.phone}</Text>
                </View>
              )}
              {user?.policy_number && (
                <View style={styles.emailContainer}>
                  <Shield size={14} color={theme.accent} />
                  <Text style={styles.userEmail}>
                    {t('profile.policyNumber') || 'Apólice'}: {user.policy_number}
                  </Text>
                </View>
              )}
              {user?.status && (
                <View style={[styles.statusBadge, user.status === 'active' && styles.statusActive]}>
                  {user.status === 'active' ? (
                    <CheckCircle2 size={14} color={theme.success} />
                  ) : (
                    <AlertCircle size={14} color={theme.warning} />
                  )}
                  <Text style={[styles.statusText, user.status === 'active' && styles.statusTextActive]}>
                    {user.status === 'active' ? t('profile.activeMember') : t('common.inactive')}
                  </Text>

                </View>
              )}
            </View>
          </View>
        </View>

        {/* Membership Info */}
        {planInfo && (
          <View style={styles.membershipSection}>
            <Text style={styles.sectionTitle}>{t('profile.currentPlan')}</Text>
            <TouchableOpacity
              style={styles.membershipCard}
              onPress={() => router.push('/plan-details')}
            >
              <View style={styles.membershipHeader}>
                <View style={styles.membershipBadge}>
                  <Shield size={20} color={theme.primary} />
                </View>
                <View style={styles.membershipInfo}>
                  <Text style={styles.membershipName}>{planInfo.name} {t('profile.plan') || 'Plan'}</Text>
                  <Text style={styles.membershipPrice}>${planInfo.price}/{t('profile.month') || 'month'}</Text>
                </View>

                <ChevronRight size={20} color={theme.textMuted} />
              </View>
              <View style={styles.membershipDivider} />
              <View style={styles.membershipStats}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{planInfo.benefits.length}</Text>
                  <Text style={styles.statLabel}>{t('profile.benefitsCount')}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>24/7</Text>
                  <Text style={styles.statLabel}>{t('profile.support247')}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>100%</Text>
                  <Text style={styles.statLabel}>{t('profile.protected100')}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {subscriptionData && (
          <View style={styles.subscriptionSection}>
            <Text style={styles.sectionTitle}>{t('profile.subscription')}</Text>
            <View style={styles.subscriptionInfo}>
              <Text style={styles.subscriptionLabel}>{t('profile.startDate')}:</Text>
              <Text style={styles.subscriptionValue}>{formatDate(subscriptionData.start_date)}</Text>
            </View>
            <View style={styles.subscriptionInfo}>
              <Text style={styles.subscriptionLabel}>{t('profile.nextBilling')}:</Text>
              <Text style={styles.subscriptionValue}>{formatDate(subscriptionData.next_billing_date)}</Text>
            </View>
            <View style={styles.subscriptionInfo}>
              <Text style={styles.subscriptionLabel}>{t('profile.status')}:</Text>
              <Text style={styles.subscriptionValue}>{subscriptionData.status}</Text>
            </View>
          </View>
        )}


        {/* Beneficiaries */}
        <View style={styles.beneficiariesSection}>
          <View style={styles.beneficiariesHeader}>
            <Text style={styles.sectionTitle}>{t('profile.beneficiaries')}</Text>
            <TouchableOpacity style={styles.addBeneficiaryButton} onPress={openAddBeneficiary}>
              <Plus size={18} color="#FFFFFF" />
              <Text style={styles.addBeneficiaryText}>{t('profile.add')}</Text>
            </TouchableOpacity>
          </View>


          <View style={styles.beneficiariesCard}>
            {beneficiaries.length === 0 ? (
              <View style={styles.beneficiariesEmpty}>
                <View style={styles.beneficiariesEmptyIcon}>
                  <Users size={22} color={theme.primary} />
                </View>
                <View style={styles.beneficiariesEmptyText}>
                  <Text style={styles.beneficiariesEmptyTitle}>Nenhum beneficiário</Text>
                  <Text style={styles.beneficiariesEmptySubtitle}>
                    Adicione filhos, mulher ou outros beneficiários com nome e documento.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.beneficiariesList}>
                {beneficiaries.map((b, idx) => (
                  <View
                    key={b.id}
                    style={[styles.beneficiaryRow, idx === beneficiaries.length - 1 && styles.beneficiaryRowLast]}
                  >
                    <View style={styles.beneficiaryMeta}>
                      <Text style={styles.beneficiaryName}>{b.fullName}</Text>
                      <Text style={styles.beneficiarySub}>
                        {b.relationship} • {maskDocument(b.document)}
                      </Text>
                    </View>
                    <View style={styles.beneficiaryActions}>
                      <TouchableOpacity
                        style={[styles.beneficiaryIconButton, styles.beneficiaryIconButtonEdit]}
                        onPress={() => openEditBeneficiary(b)}
                      >
                        <Edit3 size={18} color={theme.warning} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.beneficiaryIconButton, styles.beneficiaryIconButtonDelete]}
                        onPress={() => handleDeleteBeneficiary(b)}
                      >
                        <Trash2 size={18} color={theme.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
          <View style={styles.menuList}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, index === menuItems.length - 1 && styles.menuItemLast]}
                onPress={item.onPress}
              >
                <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                  <item.icon size={20} color={item.color} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <ChevronRight size={20} color={theme.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={theme.error} />
          <Text style={styles.logoutText}>{t('profile.signOut')}</Text>
        </TouchableOpacity>


        {/* Version */}
        <Text style={styles.versionText}>Kizola Protect v2.0.0</Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('profile.editProfile')}</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.modalCloseButton}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>


            <ScrollView contentContainerStyle={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <User size={18} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder={t('auth.fullName')}
                    placeholderTextColor={theme.textMuted}
                  />

                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Mail size={18} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={editEmail}
                    onChangeText={setEditEmail}
                    placeholder="your@email.com"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number (Optional)</Text>
                <View style={styles.inputWrapper}>
                  <Phone size={18} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={editPhone}
                    onChangeText={setEditPhone}
                    placeholder="+1 (555) 000-0000"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleUpdateProfile}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                )}

              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('profile.changePassword')}</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)} style={styles.modalCloseButton}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>


            <ScrollView contentContainerStyle={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter current password"
                    placeholderTextColor={theme.textMuted}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>New Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    placeholderTextColor={theme.textMuted}
                    secureTextEntry
                  />
                </View>
                <Text style={styles.passwordHint}>Must be at least 6 characters</Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor={theme.textMuted}
                    secureTextEntry
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleChangePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                )}

              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Beneficiary Modal */}
      <Modal
        visible={beneficiaryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBeneficiaryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {beneficiaryEditingId ? 'Editar Beneficiário' : 'Adicionar Beneficiário'}
              </Text>
              <TouchableOpacity onPress={() => setBeneficiaryModalVisible(false)} style={styles.modalCloseButton}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <Text style={styles.inputLabel}>Tipo</Text>
              <View style={styles.relationshipRow}>
                {(['Filho', 'Mulher', 'Outro'] as BeneficiaryRelationship[]).map((rel) => {
                  const active = beneficiaryRelationship === rel;
                  return (
                    <TouchableOpacity
                      key={rel}
                      onPress={() => setBeneficiaryRelationship(rel)}
                      style={[styles.relationshipChip, active && styles.relationshipChipActive]}
                    >
                      <Text style={[styles.relationshipChipText, active && styles.relationshipChipTextActive]}>
                        {rel}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nome completo</Text>
                <View style={styles.inputWrapper}>
                  <User size={18} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={beneficiaryFullName}
                    onChangeText={setBeneficiaryFullName}
                    placeholder="Ex.: Maria da Silva"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Documento</Text>
                <View style={styles.inputWrapper}>
                  <FileText size={18} color={theme.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={beneficiaryDocument}
                    onChangeText={setBeneficiaryDocument}
                    placeholder="Ex.: BI / NIF / RG / CPF"
                    placeholderTextColor={theme.textMuted}
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveButton, (beneficiarySaving || loading) && styles.saveButtonDisabled]}
                onPress={handleSaveBeneficiary}
                disabled={beneficiarySaving || loading}
              >
                {beneficiarySaving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        visible={languageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setLanguageModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('profile.selectLanguage')}</Text>
              <TouchableOpacity onPress={() => setLanguageModalVisible(false)} style={styles.modalCloseButton}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <TouchableOpacity 
                style={styles.languageOption} 
                onPress={() => {
                  i18n.changeLanguage('pt');
                  setLanguageModalVisible(false);
                }}
              >
                <View style={styles.languageOptionContent}>
                  <Text style={styles.languageFlag}>🇧🇷</Text>
                  <Text style={[styles.languageOptionText, i18n.language === 'pt' && styles.languageOptionTextActive]}>
                    Português
                  </Text>
                </View>
                {i18n.language === 'pt' && <CheckCircle2 size={20} color={theme.primary} />}
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.languageOption} 
                onPress={() => {
                  i18n.changeLanguage('en');
                  setLanguageModalVisible(false);
                }}
              >
                <View style={styles.languageOptionContent}>
                  <Text style={styles.languageFlag}>🇺🇸</Text>
                  <Text style={[styles.languageOptionText, i18n.language === 'en' && styles.languageOptionTextActive]}>
                    English
                  </Text>
                </View>
                {i18n.language === 'en' && <CheckCircle2 size={20} color={theme.primary} />}
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.languageOption} 
                onPress={() => {
                  i18n.changeLanguage('fr');
                  setLanguageModalVisible(false);
                }}
              >
                <View style={styles.languageOptionContent}>
                  <Text style={styles.languageFlag}>🇫🇷</Text>
                  <Text style={[styles.languageOptionText, i18n.language === 'fr' && styles.languageOptionTextActive]}>
                    Français
                  </Text>
                </View>
                {i18n.language === 'fr' && <CheckCircle2 size={20} color={theme.primary} />}
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.languageOption} 
                onPress={() => {
                  i18n.changeLanguage('es');
                  setLanguageModalVisible(false);
                }}
              >
                <View style={styles.languageOptionContent}>
                  <Text style={styles.languageFlag}>🇪🇸</Text>
                  <Text style={[styles.languageOptionText, i18n.language === 'es' && styles.languageOptionTextActive]}>
                    Español
                  </Text>
                </View>
                {i18n.language === 'es' && <CheckCircle2 size={20} color={theme.primary} />}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}


const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 56,
    overflow: 'hidden',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.isDark ? '#FFFFFF' : theme.text,
  },
  profileCardContainer: {
    marginTop: -30,
    marginHorizontal: 20,
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    position: 'relative',
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.accent,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.surface,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.accent,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: theme.warning + '15',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 6,
  },
  statusActive: {
    backgroundColor: theme.success + '15',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.warning,
  },
  statusTextActive: {
    color: theme.success,
  },
  membershipSection: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  subscriptionSection: {
    marginTop: 20,
    paddingHorizontal: 20,
    backgroundColor: theme.surface,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.cardBorderAlt,
  },
  subscriptionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  subscriptionLabel: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  subscriptionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  beneficiariesSection: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  beneficiariesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addBeneficiaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBeneficiaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  beneficiariesCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.cardBorderAlt,
  },
  beneficiariesEmpty: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  beneficiariesEmptyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.accent + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  beneficiariesEmptyText: {
    flex: 1,
  },
  beneficiariesEmptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  beneficiariesEmptySubtitle: {
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 18,
  },
  beneficiariesList: {
    gap: 10,
  },
  beneficiaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.cardBorderAlt,
  },
  beneficiaryRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  beneficiaryMeta: {
    flex: 1,
  },
  beneficiaryName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  beneficiarySub: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  beneficiaryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  beneficiaryIconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  beneficiaryIconButtonEdit: {
    backgroundColor: theme.warning + '15',
  },
  beneficiaryIconButtonDelete: {
    backgroundColor: theme.error + '15',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
  },
  membershipCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.cardBorderAlt,
  },
  membershipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  membershipBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: theme.accent + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  membershipInfo: {
    flex: 1,
  },
  membershipName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  membershipPrice: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  membershipDivider: {
    height: 1,
    backgroundColor: theme.cardBorderAlt,
    marginBottom: 16,
  },
  membershipStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.accent,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.cardBorderAlt,
  },
  menuSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  menuList: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.cardBorderAlt,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.cardBorderAlt,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    backgroundColor: theme.error + '15',
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.error,
  },
  versionText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 12,
    color: theme.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.cardBorderAlt,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
  },
  relationshipRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  relationshipChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.cardBorderAlt,
    backgroundColor: theme.background,
    alignItems: 'center',
  },
  relationshipChipActive: {
    backgroundColor: theme.accent,
    borderColor: theme.accent,
  },
  relationshipChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  relationshipChipTextActive: {
    color: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.cardBorderAlt,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 15,
    color: theme.text,
  },
  passwordHint: {
    fontSize: 12,
    color: theme.textMuted,
    marginTop: 6,
  },
  saveButton: {
    backgroundColor: theme.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.cardBorderAlt,
  },
  languageOptionText: {
    fontSize: 16,
    color: theme.text,
  },
  languageOptionTextActive: {
    color: theme.accent,
    fontWeight: '600',
  },
  languageOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageFlag: {
    fontSize: 22,
    marginRight: 12,
  },
});
