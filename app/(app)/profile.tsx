import { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Share, Platform, KeyboardAvoidingView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import {
  LogOut,
  CreditCard,
  Share2,
  Shield,
  FileText,
  Bookmark,
  Edit3,
  Lock,
  Globe,
  Trash2,
  LayoutDashboard,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { useTheme, Theme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { PLANS, supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

import ProfileHeader from '@/components/profile/ProfileHeader';
import MembershipCard from '@/components/profile/MembershipCard';
import BeneficiariesSection from '@/components/profile/BeneficiariesSection';
import MenuList from '@/components/profile/MenuList';
import EditProfileModal from '@/components/profile/EditProfileModal';
import ChangePasswordModal from '@/components/profile/ChangePasswordModal';
import BeneficiaryModal from '@/components/profile/BeneficiaryModal';
import LanguageModal from '@/components/profile/LanguageModal';
import { useBeneficiaries } from '@/hooks/useBeneficiaries';

const DEMO_MODE_KEY = 'kizola_demo_user';

export default function Profile() {
  const router = useRouter();
  const { user, signOut, isDemoMode, updateAvatar } = useAuth();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t, i18n } = useTranslation();

  const userIdForStorage = useMemo(() => (user?.id ? String(user.id) : 'demo'), [user?.id]);

  // Beneficiaries
  const beneficiaries = useBeneficiaries({ userIdForStorage, isDemoMode, userId: user?.id });

  // Edit profile state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');

  // Change password state
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Language modal
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Real subscription data from database
  const [subscriptionData, setSubscriptionData] = useState<{
    start_date: string | null;
    next_billing_date: string | null;
    status: string;
  } | null>(null);

  const planInfo = user?.plan && user.plan !== 'none' ? PLANS[user.plan as keyof typeof PLANS] : null;

  // Fetch real subscription data
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

  const handleLogout = () => {
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
        await SecureStore.setItemAsync(DEMO_MODE_KEY, JSON.stringify(demoUser));
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
    {
      icon: Trash2,
      title: t('profile.deleteAccount') || 'Delete Account',
      subtitle: t('profile.deleteAccountSubtitle') || 'Permanently remove your account and data',
      onPress: () => router.push('/(app)/delete-account'),
      color: theme.error,
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
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <LinearGradient colors={theme.headerGradient} style={styles.header}>
            <Text style={styles.headerTitle}>{t('profile.title')}</Text>
          </LinearGradient>

          <ProfileHeader
            user={user}
            theme={theme}
            avatarLoading={avatarLoading}
            onPickImage={handlePickImage}
            t={t}
          />

          <MembershipCard
            theme={theme}
            planInfo={planInfo}
            subscriptionData={subscriptionData}
            onPressPlan={() => router.push('/plan-details')}
            t={t}
          />

          <BeneficiariesSection
            theme={theme}
            beneficiaries={beneficiaries.beneficiaries}
            onAdd={beneficiaries.openAddBeneficiary}
            onEdit={beneficiaries.openEditBeneficiary}
            onDelete={beneficiaries.handleDeleteBeneficiary}
            t={t}
          />

          <MenuList theme={theme} items={menuItems} t={t} />

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            accessibilityLabel={t('profile.signOut')}
            accessibilityRole="button"
          >
            <LogOut size={20} color={theme.error} />
            <Text style={styles.logoutText}>{t('profile.signOut')}</Text>
          </TouchableOpacity>

          {/* Version */}
          <Text style={styles.versionText}>Kizola Protect v2.0.0</Text>
        </ScrollView>

        <EditProfileModal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          theme={theme}
          name={editName}
          email={editEmail}
          phone={editPhone}
          onChangeName={setEditName}
          onChangeEmail={setEditEmail}
          onChangePhone={setEditPhone}
          onSave={handleUpdateProfile}
          loading={loading}
          t={t}
        />

        <ChangePasswordModal
          visible={passwordModalVisible}
          onClose={() => setPasswordModalVisible(false)}
          theme={theme}
          currentPassword={currentPassword}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          onChangeCurrent={setCurrentPassword}
          onChangeNew={setNewPassword}
          onChangeConfirm={setConfirmPassword}
          onSave={handleChangePassword}
          loading={loading}
          t={t}
        />

        <BeneficiaryModal
          visible={beneficiaries.beneficiaryModalVisible}
          onClose={() => beneficiaries.setBeneficiaryModalVisible(false)}
          theme={theme}
          editingId={beneficiaries.beneficiaryEditingId}
          relationship={beneficiaries.beneficiaryRelationship}
          fullName={beneficiaries.beneficiaryFullName}
          document={beneficiaries.beneficiaryDocument}
          saving={beneficiaries.beneficiarySaving}
          onChangeRelationship={beneficiaries.setBeneficiaryRelationship}
          onChangeFullName={beneficiaries.setBeneficiaryFullName}
          onChangeDocument={beneficiaries.setBeneficiaryDocument}
          onSave={beneficiaries.handleSaveBeneficiary}
        />

        <LanguageModal
          visible={languageModalVisible}
          onClose={() => setLanguageModalVisible(false)}
          theme={theme}
          currentLanguage={i18n.language}
          onChangeLanguage={(lang) => i18n.changeLanguage(lang)}
          t={t}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 40,
    },
    keyboardView: {
      flex: 1,
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
  });
