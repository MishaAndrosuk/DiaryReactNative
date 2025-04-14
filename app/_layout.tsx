import { Stack, Redirect, usePathname } from 'expo-router';
import { Suspense, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { EventsProvider } from '../context/EventsContext';
import { TasksProvider } from '../context/TasksContext';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import { ThemeProvider } from '@/context/ThemeContext';
import * as FileSystem from 'expo-file-system';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) return null;

  return (
    <ThemeProvider>
    <Provider store={store}>
      <TasksProvider>
        <EventsProvider>
          <Suspense fallback={<ActivityIndicator size="large" />}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            {pathname === '/' && <Redirect href="/(tabs)/today" />}
          </Suspense>
        </EventsProvider>
      </TasksProvider>
    </Provider>
    </ThemeProvider>
  );
}
