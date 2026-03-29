import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { BackgroundGradient } from '@/components/BackgroundGradient';
import { useTheme } from '@/context/ThemeContext';

import { LeagueHeader } from '@/components/leagues/LeagueHeader';
import { LeagueTabsList } from '@/components/leagues/LeagueTabsList';
import { StandingsWidget } from '@/components/leagues/StandingsWidget';
import { GoldenBootWidget } from '@/components/leagues/GoldenBootWidget';
import { UpcomingMatchWidget } from '@/components/leagues/UpcomingMatchWidget';
import { BulletinWidget } from '@/components/leagues/BulletinWidget';

export default function LeagueDetailScreen() {
  const [activeTab, setActiveTab] = useState('STANDINGS');
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        bounces={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.webContainer}>
          {/* ENCABEZADO MONUMENTAL */}
          <LeagueHeader />

          {/* CONTENIDO DESLIZABLE */}
          <View style={styles.contentWrapper}>
            <LeagueTabsList activeTab={activeTab} onTabChange={setActiveTab} />
            
            <StandingsWidget />
            <GoldenBootWidget />
            <UpcomingMatchWidget />
            <BulletinWidget />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  scrollContent: {
    paddingBottom: 100, // Extra space for nav
  },
  webContainer: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  contentWrapper: {
    paddingHorizontal: 20,
    marginTop: -20, // Montarse sutilmente sobre el header
  },
});
