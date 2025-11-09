import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SystemUI from 'expo-system-ui';
import {useEffect} from "react";

export default function RootLayout() {
    useEffect(() => {
        // Set status bar background color
        SystemUI.setBackgroundColorAsync('#FFFFFF').then(r => console.log(r));
    }, []);
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="add-subscription" options={{ headerShown: false }} />
                <Stack.Screen name="edit-subscription" options={{ headerShown: false }} />
            </Stack>
        </GestureHandlerRootView>
    );
}
