import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../src/theme/tokens';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.mist,
        tabBarStyle: {
          backgroundColor: colors.ink,
          borderTopColor: colors.line,
        },
        headerStyle: {
          backgroundColor: colors.ink,
        },
        headerTintColor: colors.paper,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarLabel: '홈',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, color }}>{focused ? '🏠' : '🏘️'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="products/index"
        options={{
          title: '상품',
          tabBarLabel: '상품',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, color }}>{focused ? '📦' : '📫'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="album/index"
        options={{
          title: '내 앨범',
          tabBarLabel: '내 앨범',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 20, color }}>{focused ? '🎴' : '🃏'}</Text>
          ),
        }}
      />
    </Tabs>
  );
}
