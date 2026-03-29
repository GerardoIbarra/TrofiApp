import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { GlobalStyles } from '@/constants/GlobalStyles';
import { BackgroundGradient } from '@/components/BackgroundGradient';
import { TrofiTheme } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <View style={GlobalStyles.container}>
      <BackgroundGradient />
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={GlobalStyles.title}>Pantalla no encontrada</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Volver al inicio</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: TrofiTheme.primary,
    fontWeight: '700',
  },
});
