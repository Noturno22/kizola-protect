import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { PRIORITY_OPTIONS } from '@/lib/supabase';

interface PriorityDropdownProps {
  selected: string;
  show: boolean;
  onSelect: (priority: string) => void;
  onToggle: () => void;
  theme: any;
  styles: any;
  t: (key: string, options?: any) => string;
}

export default function PriorityDropdown({
  selected,
  show,
  onSelect,
  onToggle,
  theme,
  styles,
  t,
}: PriorityDropdownProps) {
  const getPriorityConfig = (p: string) =>
    PRIORITY_OPTIONS.find((opt) => opt.id === p) || PRIORITY_OPTIONS[1];
  const current = getPriorityConfig(selected);

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.inputLabel}>{t('support.priorityLabel')}</Text>
      <TouchableOpacity style={styles.dropdownButton} onPress={onToggle} activeOpacity={0.7}>
        <View style={styles.priorityDisplay}>
          <View style={[styles.priorityDot, { backgroundColor: current.color }]} />
          <Text style={styles.dropdownText}>{t(current.label)}</Text>
        </View>
        <ChevronDown
          size={20}
          color={theme.textMuted}
          style={{ transform: [{ rotate: show ? '180deg' : '0deg' }] }}
        />
      </TouchableOpacity>

      {show && (
        <View style={styles.dropdownMenu}>
          {PRIORITY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={styles.priorityItem}
              onPress={() => onSelect(opt.id)}
            >
              <View style={[styles.priorityDot, { backgroundColor: opt.color }]} />
              <View style={styles.priorityItemContent}>
                <Text
                  style={[
                    styles.priorityItemLabel,
                    selected === opt.id && styles.priorityItemLabelActive,
                  ]}
                >
                  {t(opt.label)}
                </Text>
                <Text style={styles.priorityItemDescription}>{t(opt.description)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
