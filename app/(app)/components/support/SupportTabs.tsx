import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MessageCircle, Sparkles } from 'lucide-react-native';

interface SupportTabsProps {
  activeTab: 'form' | 'chat';
  onTabChange: (tab: 'form' | 'chat') => void;
  theme: any;
  styles: any;
  t: (key: string, options?: any) => string;
}

export default function SupportTabs({ activeTab, onTabChange, theme, styles, t }: SupportTabsProps) {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'form' && styles.activeTab]}
        onPress={() => onTabChange('form')}
      >
        <MessageCircle size={18} color={activeTab === 'form' ? theme.accent : theme.textMuted} />
        <Text style={[styles.tabText, activeTab === 'form' && styles.activeTabText]}>
          {t('support.ticketTab') || 'Ticket'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
        onPress={() => onTabChange('chat')}
      >
        <Sparkles size={18} color={activeTab === 'chat' ? theme.accent : theme.textMuted} />
        <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>
          {t('support.aiTab') || 'Chat IA'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
