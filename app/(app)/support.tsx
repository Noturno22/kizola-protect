import { Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSupport } from './hooks/useSupport';
import SupportHeader from './components/support/SupportHeader';
import SupportTabs from './components/support/SupportTabs';
import SupportForm from './components/support/SupportForm';
import ChatSection from './components/support/ChatSection';
import SubmitSuccess from './components/support/SubmitSuccess';

export default function Support() {
  const h = useSupport();
  const insets = useSafeAreaInsets();

  if (h.submitted) {
    return (
      <SupportHeader isDark={h.isDark} theme={h.theme} styles={h.styles}>
        <SubmitSuccess
          onReset={h.handleResetSubmitted}
          onViewActivity={h.handleViewActivity}
          theme={h.theme}
          styles={h.styles}
          fadeAnim={h.fadeAnim}
          email={h.email}
          t={h.t}
        />
      </SupportHeader>
    );
  }

  return (
    <SupportHeader isDark={h.isDark} theme={h.theme} styles={h.styles}>
      <Animated.ScrollView
        contentContainerStyle={[h.styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: h.scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <SupportTabs
          activeTab={h.activeTab}
          onTabChange={h.setActiveTab}
          theme={h.theme}
          styles={h.styles}
          t={h.t}
        />
        {h.activeTab === 'form' ? (
          <SupportForm
            name={h.name}
            email={h.email}
            category={h.category}
            priority={h.priority}
            message={h.message}
            loading={h.loading}
            showCategoryDropdown={h.showCategoryDropdown}
            showPriorityDropdown={h.showPriorityDropdown}
            onChangeName={h.setName}
            onChangeEmail={h.setEmail}
            onChangeMessage={h.setMessage}
            onSubmit={h.handleSubmit}
            onToggleCategory={h.handleToggleCategoryDropdown}
            onTogglePriority={h.handleTogglePriorityDropdown}
            onSelectCategory={h.handleSelectCategory}
            onSelectPriority={h.handleSelectPriority}
            categories={h.categories}
            openWhatsApp={h.openWhatsApp}
            theme={h.theme}
            styles={h.styles}
            fadeAnim={h.fadeAnim}
            t={h.t}
          />
        ) : (
          <ChatSection
            messages={h.chatMessages}
            isTyping={h.isTyping}
            chatInput={h.chatInput}
            onSend={h.handleSendMessage}
            onInputChange={h.setChatInput}
            theme={h.theme}
            styles={h.styles}
            t={h.t}
          />
        )}
      </Animated.ScrollView>
    </SupportHeader>
  );
}
