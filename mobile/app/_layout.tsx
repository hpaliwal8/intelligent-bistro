import { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import { colors } from "../src/theme";
import { BistroSplash } from "../src/components/BistroSplash";

void SplashScreen.preventAutoHideAsync();

// Minimum on-screen time for the JSX splash, so it's actually appreciated
// even on fast cold starts. Without this the brand flashes for <100ms.
const MIN_SPLASH_MS = 900;

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });
  const [splashDone, setSplashDone] = useState(false);
  const splashOpacity = useSharedValue(1);

  // Once fonts load: hide native splash, start the minimum-display timer
  // for our branded splash. (Menu images are bundled locally now, so there's
  // no remote prefetch to kick off.)
  useEffect(() => {
    if (!fontsLoaded) return;
    void SplashScreen.hideAsync();
    const timer = setTimeout(() => {
      splashOpacity.value = withTiming(0, { duration: 260 }, (finished) => {
        if (finished) {
          runOnJS(setSplashDone)(true);
        }
      });
    }, MIN_SPLASH_MS);
    return () => clearTimeout(timer);
  }, [fontsLoaded, splashOpacity]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: splashOpacity.value,
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
          {fontsLoaded ? (
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.bg },
                animation: "fade",
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="item/[id]"
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                }}
              />
            </Stack>
          ) : null}
          {!splashDone ? (
            <Animated.View
              pointerEvents={fontsLoaded ? "none" : "auto"}
              style={[
                {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                },
                overlayStyle,
              ]}
            >
              <BistroSplash />
            </Animated.View>
          ) : null}
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
