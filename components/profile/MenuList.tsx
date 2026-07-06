import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { ChevronRight, type LucideIcon } from 'lucide-react-native';

export interface MenuItem {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onPress: () => void;
  color: string;
}

interface MenuListProps {
  theme: any;
  items: MenuItem[];
  t: (key: string) => string;
}

export default function MenuList({ theme, items, t }: MenuListProps) {
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.menuSection}>
      <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
      <View style={styles.menuList}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, index === items.length - 1 && styles.menuItemLast]}
            onPress={item.onPress}
            accessibilityLabel={item.title}
            accessibilityRole="button"
            accessibilityHint={item.subtitle}
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
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    menuSection: {
      marginTop: 24,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
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
  });
