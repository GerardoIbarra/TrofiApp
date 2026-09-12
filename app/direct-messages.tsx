import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BackgroundGradient } from '@/components/ui/branding/BackgroundGradient';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { LayoutHeader } from '@/components/ui/layout/LayoutHeader';
import { DirectMessagesView } from '@/components/chat/DirectMessagesView';

export default function DirectMessagesScreen() {
  const router = useRouter();
  const { with: withUserId, name: withUserName } = useLocalSearchParams<{
    with?: string;
    name?: string;
  }>();

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      <LayoutHeader title="MENSAJES" showBackButton={true} />
      <View style={styles.content}>
        <DirectMessagesView
          initialWithUserId={withUserId}
          initialWithUserName={withUserName}
          onBack={() => router.back()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
});
