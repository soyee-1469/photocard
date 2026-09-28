import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { ApiProvider } from '../src/services/api/ApiProvider';
import { TestModeBanner } from '../src/components/TestModeBanner';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ApiProvider>
        <View style={styles.root}>
          <TestModeBanner />
          <View style={styles.content}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </View>
        </View>
        <StatusBar style="light" />
      </ApiProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0C0908',
  },
  content: {
    flex: 1,
    maxWidth: 360,
    width: '100%',
    alignSelf: 'center',
  },
});
