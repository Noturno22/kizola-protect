import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BookOpen, ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

type Props = {
  theme: any;
  styles: any;
  onPress: () => void;
};

export function LearningCard({ theme, styles, onPress }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('dashboard.knowledgeBase')}</Text>
        <TouchableOpacity onPress={onPress}>
          <Text style={[styles.seeAllLink, { color: theme.seeAllColor }]}>{t('common.seeAll')}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.learningCard, { backgroundColor: theme.learningBg, borderColor: theme.learningBorder }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={[styles.learningIconContainer, { backgroundColor: theme.learningIconBg }]}>
          <BookOpen size={26} color={theme.accent} strokeWidth={1.8} />
        </View>
        <View style={styles.learningContent}>
          <Text style={[styles.learningTitle, { color: theme.text }]}>{t('dashboard.guidesAndResources') || 'Guias e Recursos'}</Text>
          <Text style={[styles.learningDescription, { color: theme.textSecondary }]}>
            {t('dashboard.guidesDescription') || 'Explore guias sobre impostos, imigração, habitação e mais'}
          </Text>
        </View>
        <ChevronRight size={20} color={theme.textMuted} />
      </TouchableOpacity>
    </View>
  );
}
