import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#ff4d2e',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#fff',
          height: 70,
          paddingBottom: 10,
          marginHorizontal: 0,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === 'activite') {
            return <Ionicons name={focused ? 'time' : 'time-outline'} size={28} color={color} />;
          }
          if (route.name === 'mes-albums') {
            return <Ionicons name={focused ? 'folder-open' : 'folder-open-outline'} size={28} color={color} />;
          }
          if (route.name === 'mon-profil') {
            return <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={28} color={color} />;
          }
          return null;
        },
      })}
    >
      <Tabs.Screen name="activite" options={{ title: 'Activité' }} />
      <Tabs.Screen name="mes-albums" options={{ title: 'Mes albums' }} />
      <Tabs.Screen name="mon-profil" options={{ title: 'Mon profil' }} />
    </Tabs>
  );
} 