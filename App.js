import React from 'react';
import { View, ActivityIndicator, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { AppProvider, useApp } from './src/context/AppContext';
import { CopilotProvider } from 'react-native-copilot';
import { CustomTooltip, CustomStepNumber } from './src/components/CopilotCustom';
import TabNavigator from './src/navigation/TabNavigator';
import OnboardingModal from './src/components/OnboardingModal';
import { COLORS } from './src/constants/theme';

function AppContent({ navTheme }) {
  const { booting, onboardingDone } = useApp();

  if (booting) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
        <Image
          source={require('./assets/logo.png')}
          style={{ width: 220, height: 92, resizeMode: 'contain', marginBottom: 24 }}
        />
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="light" />
        <TabNavigator />
      </NavigationContainer>
      <OnboardingModal visible={!onboardingDone} />
    </>
  );
}

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
        <Image
          source={require('./assets/logo.png')}
          style={{ width: 220, height: 92, resizeMode: 'contain', marginBottom: 24 }}
        />
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
            <AppContent navTheme={navTheme} />
          </CopilotProvider>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
