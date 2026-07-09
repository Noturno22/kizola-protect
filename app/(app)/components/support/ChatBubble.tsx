import React from 'react';
import { View, Text } from 'react-native';

interface ChatBubbleProps {
  message: { id: string; text: string; sender: 'user' | 'ai'; timestamp: Date };
  theme: any;
  styles: any;
}

export default function ChatBubble({ message, theme, styles }: ChatBubbleProps) {
  const isUser = message.sender === 'user';

  return (
    <View
      style={[
        styles.messageWrapper,
        isUser ? styles.userMessageWrapper : styles.aiMessageWrapper,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          isUser
            ? [styles.userBubble, { backgroundColor: theme.primary }]
            : [styles.aiBubble, { backgroundColor: theme.surface }],
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isUser
              ? styles.userMessageText
              : [styles.aiMessageText, { color: theme.text }],
          ]}
        >
          {message.text}
        </Text>
        <Text
          style={[
            styles.messageTime,
            isUser ? styles.userMessageTime : styles.aiMessageTime,
          ]}
        >
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}
