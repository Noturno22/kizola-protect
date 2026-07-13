import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

type Props = {
  theme: any;
  styles: any;
  user: any;
  onPress: () => void;
};

export function PlanBenefits({ theme, styles, user, onPress }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('dashboard.planBenefits') || 'Benefícios do Plano'}</Text>
        <TouchableOpacity onPress={onPress}>
          <Text style={[styles.seeAllLink, { color: theme.seeAllColor }]}>{t('common.seeAll')}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.benefitsList, { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt }]}>
        {(() => {
          const benefits = t(`plans.${user?.plan}.benefits`, { returnObjects: true });
          const benefitsArray = Array.isArray(benefits) ? benefits : [];
          return benefitsArray.slice(0, 4).map((benefit: string, index: number, arr: string[]) => (
            <View key={index} style={[styles.benefitItem, {
              borderBottomColor: theme.cardBorderAlt,
              borderBottomWidth: index < arr.length - 1 ? 1 : 0,
            }]}>
              <View style={[styles.benefitBullet, { backgroundColor: theme.accent + '18' }]}>
                <CheckCircle2 size={14} color={theme.accent} strokeWidth={2} />
              </View>
              <Text style={[styles.benefitText, { color: theme.textSecondary }]}>{benefit}</Text>
            </View>
          ));
        })()}
      </View>
    </View>
  );
}

export default PlanBenefits;
