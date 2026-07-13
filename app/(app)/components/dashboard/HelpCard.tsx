import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MessageCircle, ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

type Props = {
  theme: any;
  styles: any;
  onPress: () => void;
};

export function HelpCard({ theme, styles, onPress }: Props) {
  const { t } = useTranslation();

  return (
    <View style={[styles.section, { marginBottom: 36 }]}>
      <TouchableOpacity
        style={[styles.helpCard, { backgroundColor: theme.helpCardBg, borderColor: theme.helpCardBorder }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={[styles.helpIconContainer, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
          <MessageCircle size={22} color={theme.accentBlue} strokeWidth={1.8} />
        </View>
        <View style={styles.helpContent}>
          <Text style={[styles.helpTitle, { color: theme.text }]}>{t('dashboard.helpTitle') || 'Estamos para Ajudar-te'}</Text>
          <Text style={[styles.helpDescription, { color: theme.textSecondary }]}>
            {t('dashboard.helpDescription') || 'Disponíveis 7 dias por semana, 24 horas por dia, 365 dias por ano.'}
          </Text>
        </View>
        <ChevronRight size={20} color={theme.accentBlue} />
      </TouchableOpacity>
    </View>
  );
}

export default HelpCard;
