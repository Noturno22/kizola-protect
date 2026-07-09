import React from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  children: React.ReactNode;
  notificationsModal: React.ReactNode;
  refreshing: boolean;
  onRefresh: () => void;
  theme: any;
};

export function DashboardContent({ children, notificationsModal, refreshing, onRefresh, theme }: Props) {
  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.background }]} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
        {notificationsModal}
      </SafeAreaView>
    </>
  );
}
