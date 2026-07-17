import React from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  children: React.ReactNode;
  notificationsModal: React.ReactNode;
  refreshing: boolean;
  onRefresh: () => void;
  theme: any;
};

export function DashboardContent({ children, notificationsModal, refreshing, onRefresh, theme }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      {/* Gradient background covering entire screen including status bar */}
      <LinearGradient
        colors={theme.headerGradient}
        locations={[0, 0.35, 0.5]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
        {notificationsModal}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
});

export default DashboardContent;
