import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatSectionProps {
  messages: ChatMessage[];
  isTyping: boolean;
  chatInput: string;
  onSend: () => void;
  onInputChange: (text: string) => void;
  theme: any;
  styles: any;
  t: (key: string, options?: any) => string;
}

export default function ChatSection({
  messages,
  isTyping,
  chatInput,
  onSend,
  onInputChange,
  theme,
  styles,
  t,
}: ChatSectionProps) {
  return (
    <View style={styles.chatContainer}>
      <View style={styles.chatHeader}>
        <View style={styles.aiBadge}>
          <Sparkles size={14} color="#FFFFFF" />
          <Text style={styles.aiBadgeText}>AI Assistant</Text>
        </View>
        <Text style={styles.chatStatus}>Online</Text>
      </View>

      <View style={styles.chatMessagesList}>
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} theme={theme} styles={styles} />
        ))}
        {isTyping && (
          <View style={styles.aiMessageWrapper}>
            <View
              style={[
                styles.messageBubble,
                styles.aiBubble,
                { backgroundColor: theme.surface, paddingVertical: 12 },
              ]}
            >
              <ActivityIndicator size="small" color={theme.accent} />
            </View>
          </View>
        )}
      </View>

      <View
        style={[
          styles.chatInputContainer,
          { backgroundColor: theme.surface, borderColor: theme.cardBorderAlt },
        ]}
      >
        <ChatInput
          value={chatInput}
          onChangeText={onInputChange}
          onSend={onSend}
          loading={false}
          theme={theme}
          styles={styles}
          t={t}
        />
      </View>
    </View>
  );
}
