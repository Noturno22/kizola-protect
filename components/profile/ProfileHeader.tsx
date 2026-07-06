import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useMemo } from 'react';
import { Camera, Mail, Phone, Shield, CheckCircle2, AlertCircle } from 'lucide-react-native';

interface ProfileHeaderProps {
  user: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    avatar_url?: string;
    policy_number?: string;
    status?: string;
  } | null;
  theme: any;
  avatarLoading: boolean;
  onPickImage: () => void;
  t: (key: string) => string;
}

export default function ProfileHeader({ user, theme, avatarLoading, onPickImage, t }: ProfileHeaderProps) {
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.profileCardContainer}>
      <View style={styles.profileCard}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={onPickImage}
          activeOpacity={0.8}
          accessibilityLabel={t('profile.changeAvatar') || 'Change profile picture'}
          accessibilityRole="button"
          accessibilityHint="Opens image picker to change your avatar"
        >
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
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
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
  });
