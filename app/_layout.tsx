import "../global.css";
import { useEffect } from "react";
import { LogBox } from "react-native";
import { Slot, SplashScreen } from "expo-router";

// Suppress known RN-web rendering warning (stray text node from NativeWind/CSS-in-JS)
LogBox.ignoreLogs(["Unexpected text node"]);
import { useFonts } from "expo-font";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/api/query-client";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { SessionProvider } from "@/components/SessionProvider";
import { useNetworkStore, setNetworkChangeCallback } from "@/store/network-store";
import { onNetworkChange } from "@/lib/offline/sync-manager";
import { useSyncStore } from "@/store/sync-store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PushNotificationProvider } from "@/components/push/PushNotificationProvider";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faHouse,
  faCalendar,
  faRoute,
  faComment,
  faEllipsis,
  faBriefcase,
  faFingerprint,
  faClock,
  faCamera,
  faLocationArrow,
  faRobot,
  faShield,
  faLeaf,
  faBell,
  faLocationDot,
  faUsers,
  faCircleCheck,
  faCircleXmark,
  faTriangleExclamation,
  faCircleInfo,
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faArrowLeft,
  faChevronRight,
  faGear,
  faRightFromBracket,
  faKey,
  faPlus,
  // M-02 icons
  faPause,
  faPlay,
  faDeleteLeft,
  faSun,
  faFileInvoiceDollar,
  faNoteSticky,
  faPhone,
  faCheck,
  faCircleExclamation,
  faStopwatch,
  faChartLine,
  faArrowTrendUp,
  faShieldHalved,
  faSackDollar,
  faCar,
  faPersonRunning,
  faFlag,
  faMugHot,
  faRoad,
  faMapPin,
  faCopy,
  faChevronDown,
  faChevronLeft,
  faEllipsisVertical,
  faBullhorn,
  faCircle,
  faListCheck,
  // M-07 offline icons
  faCloud,
  faCloudArrowUp,
  faCloudArrowDown,
  faRotate,
  faWifi,
  faCloudBolt,
  // M-09 notification icons
  faCheckDouble,
  faXmark,
  // M-10 route icons
  faWandMagicSparkles,
  faFlagCheckered,
  faMap,
  faRotateRight,
  // M-11 CRM icons
  faBuilding,
  faAddressBook,
  faMagnifyingGlass,
  faGlobe,
  faIndustry,
  faArrowDownShortWide,
  faUser,
  faMapMarkerAlt,
  faDollarSign,
  faCalendarCheck,
  faPaperPlane,
  faThumbtack,
  faClockRotateLeft,
  // M-12 chat icons
  faComments,
} from "@fortawesome/free-solid-svg-icons";
import {
  faBell as faBellRegular,
  faCalendar as faCalendarRegular,
  faClock as faClockRegular,
  faCopy as faCopyRegular,
} from "@fortawesome/free-regular-svg-icons";

// Prevent splash screen from auto-hiding until session is determined
SplashScreen.preventAutoHideAsync();

// Register Font Awesome icons once
library.add(
  faHouse,
  faCalendar,
  faRoute,
  faComment,
  faEllipsis,
  faBriefcase,
  faFingerprint,
  faClock,
  faCamera,
  faLocationArrow,
  faRobot,
  faShield,
  faLeaf,
  faBell,
  faLocationDot,
  faUsers,
  faCircleCheck,
  faCircleXmark,
  faTriangleExclamation,
  faCircleInfo,
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faArrowLeft,
  faChevronRight,
  faGear,
  faRightFromBracket,
  faKey,
  faPlus,
  // M-02 icons
  faPause,
  faPlay,
  faDeleteLeft,
  faSun,
  faFileInvoiceDollar,
  faNoteSticky,
  faPhone,
  faCheck,
  faCircleExclamation,
  faStopwatch,
  faChartLine,
  faArrowTrendUp,
  faShieldHalved,
  faSackDollar,
  faCar,
  faPersonRunning,
  faFlag,
  faMugHot,
  faRoad,
  faMapPin,
  faCopy,
  faChevronDown,
  faChevronLeft,
  faEllipsisVertical,
  faBullhorn,
  faCircle,
  faListCheck,
  // M-07 offline icons
  faCloud,
  faCloudArrowUp,
  faCloudArrowDown,
  faRotate,
  faWifi,
  faCloudBolt,
  // M-09 notification icons
  faCheckDouble,
  faXmark,
  // M-10 route icons
  faWandMagicSparkles,
  faFlagCheckered,
  faMap,
  faRotateRight,
  // M-11 CRM icons
  faBuilding,
  faAddressBook,
  faMagnifyingGlass,
  faGlobe,
  faIndustry,
  faArrowDownShortWide,
  faUser,
  faMapMarkerAlt,
  faDollarSign,
  faCalendarCheck,
  faPaperPlane,
  faThumbtack,
  faClockRotateLeft,
  // M-12 chat icons
  faComments,
  // Regular variants
  faBellRegular,
  faCalendarRegular,
  faClockRegular,
  faCopyRegular
);

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans: require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    JetBrainsMono: require("../assets/fonts/JetBrainsMono-Regular.ttf"),
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  });

  useEffect(() => {
    // Restore persisted network state before subscribing (avoids flash of wrong state)
    useNetworkStore.getState().restoreState().catch(() => {});

    // Wire SyncManager to network transitions (S6)
    setNetworkChangeCallback(onNetworkChange);

    // Restore sync state (lastSyncedAt)
    useSyncStore.getState().restoreState().catch(() => {});

    const unsubscribe = useNetworkStore.getState().subscribe();
    return unsubscribe;
  }, []);

  // Don't render anything until fonts are loaded
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <SessionProvider>
            <PushNotificationProvider />
            <Slot />
          </SessionProvider>
          <ToastProvider />
        </ErrorBoundary>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
