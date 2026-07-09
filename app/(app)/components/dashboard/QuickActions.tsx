import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

type ActionItem = {
  label: string;
  sub: string;
  icon: React.ComponentType<any>;
  color: string;
  bg: string;
  route: string;
};

type Props = {
  theme: any;
  styles: any;
  actions: ActionItem[];
  onActionPress: (route: string) => void;
};

export function QuickActions({ theme, styles, actions, onActionPress }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('dashboard.quickActions')}</Text>
      <View style={styles.actionsGrid}>
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <TouchableOpacity
              key={i}
              style={[styles.actionCard, { backgroundColor: theme.actionCardBg, borderColor: theme.cardBorderAlt }]}
              onPress={() => onActionPress(action.route)}
              activeOpacity={0.75}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.bg }]}>
                <Icon size={22} color={action.color} strokeWidth={1.8} />
              </View>
              <Text style={[styles.actionTitle, { color: theme.text }]}>{action.label}</Text>
              <Text style={[styles.actionSubtitle, { color: theme.textMuted }]}>{action.sub}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
