import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { AppProvider } from './src/context/AppContext';
import { CopilotProvider } from 'react-native-copilot';
import { CustomTooltip, CustomStepNumber } from './src/components/CopilotCustom';
import TabNavigator from './src/navigation/TabNavigator';
import { COLORS } from './src/constants/theme';

export default function App() {
  const [fontsLoaded] = useFonts({
    'GeistPixel': require('./assets/fonts/GeistPixel-Square.ttf'),
    'Geist-Regular': require('./assets/fonts/Geist-Regular.ttf'),
    'Geist-Medium': require('./assets/fonts/Geist-Medium.ttf'),
    'Geist-SemiBold': require('./assets/fonts/Geist-SemiBold.ttf'),
    'Geist-Bold': require('./assets/fonts/Geist-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }

  const navTheme = {
    dark: true,
    colors: {
      primary: COLORS.primary,
      background: COLORS.bg,
      card: COLORS.card,
      text: COLORS.text,
      border: COLORS.border,
      notification: COLORS.red,
    },
    fonts: {
      regular: { fontFamily: 'Geist-Regular', fontWeight: '400' },
      medium: { fontFamily: 'Geist-Medium', fontWeight: '500' },
      bold: { fontFamily: 'Geist-Bold', fontWeight: '700' },
      heavy: { fontFamily: 'Geist-Bold', fontWeight: '800' },
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <CopilotProvider
            overlay="svg"
            backdropColor={COLORS.overlay}
            tooltipComponent={CustomTooltip}
            stepNumberComponent={CustomStepNumber}
            animated={true}
            arrowColor={COLORS.card}
            verticalOffset={18}
          >
            <NavigationContainer theme={navTheme}>
              <StatusBar style="light" />
              <TabNavigator />
            </NavigationContainer>
          </CopilotProvider>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
