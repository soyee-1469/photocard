import { Tabs } from 'expo-router';
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
        }}
      />
      <Tabs.Screen
        name="products/index"
        options={{
          title: '상품',
          tabBarLabel: '상품',
        }}
      />
      <Tabs.Screen
        name="album/index"
        options={{
          title: '내 앨범',
          tabBarLabel: '내 앨범',
        }}
      />
    </Tabs>
  );
}
