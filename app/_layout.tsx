import "../global.css";
import { useEffect } from "react";
import { Slot, SplashScreen } from "expo-router";
import { useFonts } from "expo-font";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/api/query-client";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { SessionProvider } from "@/components/SessionProvider";
import { useNetworkStore } from "@/store/network-store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
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
            <Slot />
          </SessionProvider>
          <ToastProvider />
        </ErrorBoundary>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
