import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Clock, Bookmark, Share2, ChevronRight } from 'lucide-react-native';
import { LearningArticle } from '@/lib/supabase';
import { Theme } from '@/providers/ThemeProvider';
import { useRouter } from 'expo-router';
import { renderArticleContent, createArticleContentStyles } from '../../utils/renderArticleContent';

interface ArticleModalProps {
  selectedArticle: LearningArticle | null;
  onClose: () => void;
  getCategoryConfig: (category: string) => {
    icon: React.ComponentType<{ size?: number; color?: string }>;
    color: string;
    label: string;
  };
  markAsRead: (articleId: string) => Promise<void>;
  theme: Theme;
  isDark: boolean;
  t: (key: string) => string;
  scrollY: Animated.Value;
}

export function ArticleModal({
  selectedArticle,
  onClose,
  getCategoryConfig,
  markAsRead,
  theme,
  isDark,
  t,
  scrollY,
}: ArticleModalProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);
  const articleContentStyles = useMemo(
    () => createArticleContentStyles(theme),
    [theme],
  );

  return (
    <Modal
      visible={selectedArticle !== null}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {selectedArticle &&
          (() => {
            const config = getCategoryConfig(selectedArticle.category);
            const Icon = config.icon;

            return (
              <>
                <SafeAreaView
                  edges={['top']}
                  style={[
                    styles.modalNavArea,
                    {
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      zIndex: 100,
                    },
                  ]}
                >
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.modalCloseCircle}
                    activeOpacity={0.7}
                  >
                    <X size={22} color={theme.text} />
                  </TouchableOpacity>

                  <View style={styles.modalNavActions}>
                    <TouchableOpacity style={styles.modalActionCircle}>
                      <Bookmark size={20} color={theme.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalActionCircle}>
                      <Share2 size={20} color={theme.text} />
                    </TouchableOpacity>
                  </View>
                </SafeAreaView>

                {/* Reading Progress Bar */}
                <View style={styles.progressContainer}>
                  <Animated.View
                    style={[
                      styles.progressBar,
                      {
                        backgroundColor: config.color,
                        width: scrollY.interpolate({
                          inputRange: [0, 500],
                          outputRange: ['0%', '100%'],
                          extrapolate: 'clamp',
                        }),
                      },
                    ]}
                  />
                </View>

                <Animated.ScrollView
                  contentContainerStyle={{
                    paddingBottom: insets.bottom + 40,
                  }}
                  showsVerticalScrollIndicator={false}
                  onScroll={Animated.event(
                    [
                      {
                        nativeEvent: { contentOffset: { y: scrollY } },
                      },
                    ],
                    { useNativeDriver: false },
                  )}
                  scrollEventThrottle={16}
                  onMomentumScrollEnd={(e) => {
                    const { layoutMeasurement, contentOffset, contentSize } =
                      e.nativeEvent;
                    if (
                      layoutMeasurement.height + contentOffset.y >=
                      contentSize.height - 20
                    ) {
                      markAsRead(selectedArticle.id);
                    }
                  }}
                >
                  <View
                    style={[
                      styles.modalHeaderGraphic,
                      {
                        backgroundColor: config.color + '15',
                        zIndex: 10,
                      },
                    ]}
                  >
                    <View style={styles.modalHeroContent}>
                      <View
                        style={[
                          styles.modalHeroIconWrapper,
                          {
                            backgroundColor: theme.surface,
                            shadowColor: config.color,
                          },
                        ]}
                      >
                        <Icon size={40} color={config.color} />
                      </View>
                      <View
                        style={[
                          styles.modalHeroTag,
                          { backgroundColor: config.color },
                        ]}
                      >
                        <Text style={styles.modalHeroTagText}>
                          {config.label}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.modalBody}>
                    <View style={styles.modalTitleSection}>
                      <Text style={styles.modalArticleTitle}>
                        {t(selectedArticle.title)}
                      </Text>
                      <View style={styles.modalMetaBar}>
                        <View style={styles.modalMetaItem}>
                          <Clock size={16} color={theme.textMuted} />
                          <Text style={styles.modalMetaText}>
                            {selectedArticle.readTime} {t('learn.minRead')}
                          </Text>
                        </View>
                        <View style={styles.modalMetaDivider} />
                        <Text style={styles.modalMetaDate}>
                          {new Date().toLocaleDateString()}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.modalArticleContent}>
                      {renderArticleContent(
                        t(selectedArticle.content),
                        articleContentStyles,
                      )}
                    </View>

                    <View style={styles.modalFooter}>
                      <LinearGradient
                        colors={[theme.background, theme.surface]}
                        style={styles.modalHelpBox}
                      >
                        <Text style={styles.modalHelpTitle}>
                          {t('learn.needHelp')}
                        </Text>
                        <Text style={styles.modalHelpText}>
                          {t('learn.helpDesc')}
                        </Text>
                        <TouchableOpacity
                          style={[
                            styles.modalCtaButton,
                            { backgroundColor: config.color },
                          ]}
                          onPress={() => {
                            onClose();
                            setTimeout(() => router.push('/support'), 300);
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.modalCtaText}>
                            {t('learn.helpTopic')}
                          </Text>
                          <ChevronRight size={18} color="#FFFFFF" />
                        </TouchableOpacity>
                      </LinearGradient>
                    </View>
                  </View>
                </Animated.ScrollView>
              </>
            );
          })()}
      </View>
    </Modal>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: theme.surface,
    },
    modalHeaderGraphic: {
      height: 240,
      position: 'relative',
      borderBottomLeftRadius: 32,
      borderBottomRightRadius: 32,
    },
    modalNavArea: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 20,
      paddingTop: 10,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      zIndex: 10,
    },
    modalCloseCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    modalNavActions: {
      flexDirection: 'row',
      gap: 12,
    },
    modalActionCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    progressContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      backgroundColor: 'rgba(0,0,0,0.05)',
      zIndex: 1000,
    },
    progressBar: {
      height: '100%',
    },
    modalHeroContent: {
      position: 'absolute',
      bottom: -40,
      left: 24,
      right: 24,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
    },
    modalHeroIconWrapper: {
      width: 88,
      height: 88,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 10,
    },
    modalHeroTag: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
      marginBottom: 8,
    },
    modalHeroTagText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    modalBody: {
      paddingTop: 64,
      paddingHorizontal: 24,
    },
    modalTitleSection: {
      marginBottom: 32,
    },
    modalArticleTitle: {
      fontSize: 30,
      fontWeight: '800',
      color: theme.text,
      lineHeight: 38,
      marginBottom: 16,
      letterSpacing: -0.5,
    },
    modalMetaBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    modalMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    modalMetaText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    modalMetaDivider: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.cardBorderAlt,
    },
    modalMetaDate: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textMuted,
    },
    modalArticleContent: {
      gap: 12,
    },
    modalFooter: {
      marginTop: 40,
    },
    modalHelpBox: {
      borderRadius: 24,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.cardBorderAlt,
    },
    modalHelpTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 8,
    },
    modalHelpText: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 20,
    },
    modalCtaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 14,
    },
    modalCtaText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
