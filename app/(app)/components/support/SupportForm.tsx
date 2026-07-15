import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Phone,
  Mail,
  ChevronRight,
  Shield,
  Sparkles,
  Send,
} from 'lucide-react-native';
import CategoryDropdown from './CategoryDropdown';
import PriorityDropdown from './PriorityDropdown';

const { width } = Dimensions.get('window');

interface SupportFormProps {
  name: string;
  email: string;
  category: string;
  priority: string;
  message: string;
  loading: boolean;
  showCategoryDropdown: boolean;
  showPriorityDropdown: boolean;
  onChangeName: (v: string) => void;
  onChangeEmail: (v: string) => void;
  onChangeMessage: (v: string) => void;
  onSubmit: () => void;
  onToggleCategory: () => void;
  onTogglePriority: () => void;
  onSelectCategory: (id: string) => void;
  onSelectPriority: (p: string) => void;
  categories: readonly { id: string; labelKey: string; icon: any; color: string; label: string }[];
  openWhatsApp: () => void;
  theme: any;
  styles: any;
  fadeAnim: Animated.Value;
  t: (key: string, options?: any) => string;
}

export default function SupportForm({
  name,
  email,
  category,
  priority,
  message,
  loading,
  showCategoryDropdown,
  showPriorityDropdown,
  onChangeName,
  onChangeEmail,
  onChangeMessage,
  onSubmit,
  onToggleCategory,
  onTogglePriority,
  onSelectCategory,
  onSelectPriority,
  categories,
  openWhatsApp,
  theme,
  styles,
  fadeAnim,
  t,
}: SupportFormProps) {
  return (
    <>
      {/* Quick Contact Cards */}
      <View style={styles.contactSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.contactScroll}
          snapToInterval={width * 0.75 + 16}
          decelerationRate="fast"
        >
          <TouchableOpacity style={styles.contactCard} onPress={openWhatsApp} activeOpacity={0.9}>
            <LinearGradient
              colors={['#25D366', '#128C7E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.contactCardBg}
            />
            <View style={styles.contactCardContent}>
              <View style={styles.contactCardIcon}>
                <Phone size={24} color={theme.isDark ? '#FFFFFF' : '#1E293B'} />
              </View>
              <Text style={styles.contactCardLabel}>{t('support.whatsapp')}</Text>
              <Text style={styles.contactCardValue}>+1 (929) 609-7035</Text>
              <View style={styles.contactCardAction}>
                <Text style={styles.contactCardActionText}>{t('common.contact')}</Text>
                <ChevronRight size={16} color={theme.isDark ? '#FFFFFF' : '#1E293B'} />
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.contactCard}>
            <LinearGradient
              colors={[theme.accentBlue, '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.contactCardBg}
            />
            <View style={styles.contactCardContent}>
              <View style={styles.contactCardIcon}>
                <Mail size={24} color={theme.isDark ? '#FFFFFF' : '#1E293B'} />
              </View>
              <Text style={styles.contactCardLabel}>{t('support.email')}</Text>
              <Text style={styles.contactCardValue}>support@kizola.protect</Text>
              <View style={styles.contactCardAction}>
                <Text style={styles.contactCardActionText}>{t('support.hours2448')}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Transparent Commitment Section */}
      <View style={styles.commitmentSection}>
        <BlurView intensity={80} tint={theme.isDark ? 'dark' : 'light'} style={styles.commitmentCard}>
          <View style={styles.commitmentHeader}>
            <Shield size={20} color={theme.accent} />
            <Text style={styles.commitmentTitle}>{t('support.commitmentTitle')}</Text>
          </View>
          <Text style={styles.commitmentText}>{t('support.commitmentText')}</Text>
        </BlurView>
      </View>

      {/* Support Form */}
      <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
        <View style={styles.formHeader}>
          <Sparkles size={20} color={theme.accent} />
          <Text style={styles.formTitle}>{t('support.requestAssistance')}</Text>
        </View>

        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('support.fullNameLabel')}</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={onChangeName}
              placeholder={t('support.fullNamePlaceholder')}
              placeholderTextColor={theme.textMuted}
            />
          </View>
        </View>

        {/* Email Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('support.emailLabel')}</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={onChangeEmail}
              placeholder={t('support.emailPlaceholder')}
              placeholderTextColor={theme.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Category Dropdown */}
        <CategoryDropdown
          categories={categories}
          selected={category}
          show={showCategoryDropdown}
          onSelect={onSelectCategory}
          onToggle={onToggleCategory}
          theme={theme}
          styles={styles}
          t={t}
        />

        {/* Priority Dropdown */}
        <PriorityDropdown
          selected={priority}
          show={showPriorityDropdown}
          onSelect={onSelectPriority}
          onToggle={onTogglePriority}
          theme={theme}
          styles={styles}
          t={t}
        />

        {/* Message Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t('support.messageLabel')}</Text>
          <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={message}
              onChangeText={onChangeMessage}
              placeholder={t('support.messagePlaceholder')}
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
          <Text style={styles.characterCount}>
            {message.length} {t('support.characters')}{' '}
            {message.length < 20 && t('support.min20')}
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={onSubmit}
          disabled={loading}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={loading ? ['#CBD5E1', '#94A3B8'] : [theme.accent, theme.accent + 'DD']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>{t('support.submitRequest')}</Text>
              <Send size={18} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}
