import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle2, XCircle, X, Star, MessageCircle } from 'lucide-react-native';
import { useTheme, Theme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface SatisfactionModalProps {
  visible: boolean;
  onClose: () => void;
  requestId: string;
  requestType: 'support' | 'housing' | 'finance';
  onRated?: () => void;
}

export function SatisfactionModal({
  visible,
  onClose,
  requestId,
  requestType,
  onRated,
}: SatisfactionModalProps) {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [resolved, setResolved] = useState<boolean | null>(null);
  const [problemPersists, setProblemPersists] = useState<boolean | null>(null);
  const [whatWasntResolved, setWhatWasntResolved] = useState('');
  const [additionalComments, setAdditionalComments] = useState('');
  const [rating, setRating] = useState(0);
  const [step, setStep] = useState<'main' | 'followup' | 'done'>('main');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setResolved(null);
    setProblemPersists(null);
    setWhatWasntResolved('');
    setAdditionalComments('');
    setRating(0);
    setStep('main');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleResolved = async (isResolved: boolean) => {
    setResolved(isResolved);
    if (isResolved) {
      setStep('followup');
    } else {
      setStep('followup');
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const ratingData = {
        user_id: user.id,
        request_type: requestType,
        request_id: requestId,
        resolved: resolved ?? false,
        problem_persists: !resolved ? problemPersists : false,
        what_wasnt_resolved: !resolved ? whatWasntResolved.trim() || null : null,
        additional_comments: additionalComments.trim() || null,
        rating: rating > 0 ? rating : null,
        created_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured()) {
        const { error } = await supabase.from('satisfaction_ratings').insert(ratingData);
        if (error) {
          console.warn('[Satisfaction] Failed to save rating:', error);
          // Non-critical — don't throw
        }

        // If unresolved, reopen the case
        if (!resolved && requestType === 'support') {
          await supabase
            .from('support_requests')
            .update({ status: 'pending', updated_at: new Date().toISOString() })
            .eq('id', requestId)
            .catch(() => {});
        }
      }

      setStep('done');
      onRated?.();
    } catch (error) {
      console.error('[Satisfaction] Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />

        <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
          <View style={styles.dragIndicator} />

          {/* Close Button */}
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: theme.background }]}
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Close satisfaction survey"
            accessibilityHint="Discard your feedback and close"
          >
            <X size={18} color={theme.textSecondary} />
          </TouchableOpacity>

          {step === 'main' && (
            <>
              <View style={styles.questionIcon}>
                <MessageCircle size={40} color={theme.primary} />
              </View>

              <Text style={[styles.questionTitle, { color: theme.text }]}>
                Caro cliente, conseguimos resolver a sua situação?
              </Text>
              <Text style={[styles.questionSubtitle, { color: theme.textSecondary }]}>
                A sua opinião ajuda-nos a melhorar o nosso serviço.
              </Text>

              {/* Star Rating */}
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setRating(i)}
                    style={styles.starButton}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`${i} star${i > 1 ? 's' : ''}`}
                    accessibilityHint="Rate your experience on a scale of 1 to 5 stars"
                  >
                    <Star
                      size={36}
                      color={i <= rating ? '#F59E0B' : theme.cardBorderAlt}
                      fill={i <= rating ? '#F59E0B' : 'transparent'}
                      strokeWidth={1.5}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Yes/No Buttons */}
              <View style={styles.answerRow}>
                <TouchableOpacity
                  style={[styles.answerButton, styles.yesButton]}
                  onPress={() => handleResolved(true)}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Yes, my issue was resolved"
                  accessibilityHint="Confirm that your issue was resolved successfully"
                >
                  <LinearGradient
                    colors={['#22C55E', '#16A34A']}
                    style={StyleSheet.absoluteFillObject}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                  <CheckCircle2 size={22} color="#FFFFFF" />
                  <Text style={styles.answerButtonText}>Sim, foi resolvido</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.answerButton, styles.noButton, { borderColor: '#EF4444' }]}
                  onPress={() => handleResolved(false)}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="No, my issue persists"
                  accessibilityHint="Report that your issue was not resolved"
                >
                  <XCircle size={22} color="#EF4444" />
                  <Text style={[styles.answerButtonText, { color: '#EF4444' }]}>Não, o problema persiste</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === 'followup' && (
            <>
              <View style={[styles.questionIcon, { backgroundColor: resolved ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }]}>
                {resolved
                  ? <CheckCircle2 size={40} color="#22C55E" />
                  : <XCircle size={40} color="#EF4444" />
                }
              </View>

              <Text style={[styles.questionTitle, { color: theme.text }]}>
                {resolved ? 'Que bom! Obrigado pelo feedback.' : 'Lamentamos que o problema persista.'}
              </Text>

              {!resolved && (
                <>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                    O que não foi resolvido?
                  </Text>
                  <View style={[styles.textInput, { backgroundColor: theme.background, borderColor: theme.cardBorderAlt }]}>
                    <TextInput
                      style={[styles.textInputField, { color: theme.text }]}
                      placeholder="Descreva o que ainda não foi resolvido..."
                      placeholderTextColor={theme.textMuted}
                      value={whatWasntResolved}
                      onChangeText={setWhatWasntResolved}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                </>
              )}

              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Comentários adicionais
              </Text>
              <View style={[styles.textInput, { backgroundColor: theme.background, borderColor: theme.cardBorderAlt }]}>
                <TextInput
                  style={[styles.textInputField, { color: theme.text }]}
                  placeholder="Partilhe qualquer outro comentário..."
                  placeholderTextColor={theme.textMuted}
                  value={additionalComments}
                  onChangeText={setAdditionalComments}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, loading && { opacity: 0.6 }, { overflow: 'hidden' }]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Submit evaluation"
                accessibilityHint="Send your feedback to our team"
              >
                <LinearGradient
                  colors={loading ? ['#CBD5E1', '#94A3B8'] : [theme.primary, theme.primary + 'DD']}
                  style={StyleSheet.absoluteFillObject}
                />
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Enviar Avaliação</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleClose}
                style={styles.skipBtn}
                accessibilityRole="button"
                accessibilityLabel="Skip feedback"
                accessibilityHint="Close without submitting feedback"
              >
                <Text style={[styles.skipBtnText, { color: theme.textMuted }]}>Saltar</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 'done' && (
            <>
              <View style={[styles.questionIcon, { backgroundColor: 'rgba(34,197,94,0.1)' }]}>
                <CheckCircle2 size={40} color="#22C55E" />
              </View>
              <Text style={[styles.questionTitle, { color: theme.text }]}>
                Obrigado pelo seu feedback!
              </Text>
              <Text style={[styles.questionSubtitle, { color: theme.textSecondary }]}>
                {resolved
                  ? 'Ficamos felizes por ter conseguido ajudar. Até breve!'
                  : 'A nossa equipa vai dar seguimento ao seu caso em breve.'
                }
              </Text>
              <TouchableOpacity
                style={[styles.submitBtn, { overflow: 'hidden', marginTop: 8 }]}
                onPress={handleClose}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Close feedback screen"
                accessibilityHint="Return to the app"
              >
                <LinearGradient
                  colors={['#22C55E', '#16A34A']}
                  style={StyleSheet.absoluteFillObject}
                />
                <Text style={styles.submitBtnText}>Fechar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 24,
    position: 'relative',
  },
  dragIndicator: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.cardBorderAlt,
    alignSelf: 'center',
    marginBottom: 20,
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionIcon: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: theme.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  questionTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  questionSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 28,
  },
  starButton: { padding: 4 },
  answerRow: {
    gap: 12,
  },
  answerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  yesButton: {
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  noButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  answerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 4,
  },
  textInputField: {
    fontSize: 15,
    lineHeight: 22,
    minHeight: 72,
  },
  submitBtn: {
    borderRadius: 16,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  skipBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
