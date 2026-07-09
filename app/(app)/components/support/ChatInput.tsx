import React from 'react';
import { TextInput, TouchableOpacity } from 'react-native';
import { Send } from 'lucide-react-native';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  loading: boolean;
  theme: any;
  styles: any;
  t: (key: string, options?: any) => string;
}

export default function ChatInput({ value, onChangeText, onSend, loading, theme, styles, t }: ChatInputProps) {
  return (
    <React.Fragment>
      <TextInput
        style={[styles.chatInput, { color: theme.text }]}
        placeholder={t('support.typeMessage') || 'Escreva sua dúvida...'}
        placeholderTextColor={theme.textMuted}
        value={value}
        onChangeText={onChangeText}
        multiline
      />
      <TouchableOpacity
        style={[styles.chatSendButton, { backgroundColor: theme.primary }]}
        onPress={onSend}
        activeOpacity={0.8}
      >
        <Send size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </React.Fragment>
  );
}
