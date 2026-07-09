import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronDown, Info } from 'lucide-react-native';

interface CategoryDropdownProps {
  categories: readonly { id: string; labelKey: string; icon: any; color: string; label: string }[];
  selected: string;
  show: boolean;
  onSelect: (catId: string) => void;
  onToggle: () => void;
  theme: any;
  styles: any;
  t: (key: string, options?: any) => string;
}

export default function CategoryDropdown({
  categories,
  selected,
  show,
  onSelect,
  onToggle,
  theme,
  styles,
  t,
}: CategoryDropdownProps) {
  const selectedCat = categories.find((c) => c.id === selected);
  const SelectedIcon = selectedCat?.icon || Info;

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.inputLabel}>{t('support.categoryLabel')}</Text>
      <TouchableOpacity style={styles.dropdownButton} onPress={onToggle} activeOpacity={0.7}>
        <View style={styles.dropdownContent}>
          {selected && selectedCat && (
            <View style={[styles.categoryIcon, { backgroundColor: (selectedCat.color || theme.accent) + '20' }]}>
              <SelectedIcon size={18} color={selectedCat.color || theme.accent} />
            </View>
          )}
          <Text style={selected ? styles.dropdownText : styles.dropdownPlaceholder}>
            {selected ? t(selectedCat?.labelKey || '') : t('support.categoryPlaceholder')}
          </Text>
        </View>
        <ChevronDown
          size={20}
          color={theme.textMuted}
          style={{ transform: [{ rotate: show ? '180deg' : '0deg' }] }}
        />
      </TouchableOpacity>

      {show && (
        <View style={styles.dropdownMenu}>
          {categories.map((cat) => {
            const CatIcon = cat.icon;
            return (
              <TouchableOpacity
                key={cat.id}
                style={styles.dropdownItem}
                onPress={() => onSelect(cat.id)}
              >
                <View style={[styles.itemIconWrapper, { backgroundColor: cat.color + '15' }]}>
                  <CatIcon size={18} color={cat.color} />
                </View>
                <Text
                  style={[
                    styles.dropdownItemText,
                    selected === cat.id && styles.dropdownItemTextActive,
                  ]}
                >
                  {t(cat.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}
