import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

const MOCK_NEWS = [
  { id: '1', title: 'Season Final venue confirmed for Zapopan Arena.', time: '2 hours ago', img: 'https://images.unsplash.com/photo-1574629810360-7efbb1b37f48?q=80&w=200&auto=format&fit=crop' },
  { id: '2', title: 'Transfer window opens for mid-season registrations.', time: 'Yesterday', img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=200&auto=format&fit=crop' }
];

export function BulletinWidget() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  return (
    <View style={styles.card}>
      <Text style={styles.overline}>LEAGUE BULLETIN</Text>

      {MOCK_NEWS.map((news) => (
        <TouchableOpacity key={news.id} style={styles.newsRow} activeOpacity={0.7}>
          <Image source={{ uri: news.img }} style={styles.newsImage} />
          <View style={styles.newsContent}>
            <Text style={styles.newsTitle} numberOfLines={2}>
              {news.title}
            </Text>
            <Text style={styles.newsTime}>{news.time}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  card: {
    backgroundColor: theme.surface, 
    borderRadius: 20,
    padding: 20,
    marginBottom: 100, // Extra margin for bottom nav bar
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    elevation: isDark ? 0 : 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0 : 0.05,
    shadowRadius: 5,
  },
  overline: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.textSecondary,
    letterSpacing: 2,
    marginBottom: 20,
  },
  newsRow: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  newsImage: {
    width: 60,
    height: 45,
    borderRadius: 6,
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  },
  newsContent: {
    flex: 1,
    marginLeft: 15,
  },
  newsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
    lineHeight: 16,
  },
  newsTime: {
    fontSize: 8,
    color: theme.textSecondary,
  },
});
