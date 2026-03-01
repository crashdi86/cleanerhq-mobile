import { View, Text, Pressable, StyleSheet } from "react-native";
import { type BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faHouse,
  faCalendar,
  faRoute,
  faBriefcase,
  faComment,
  faEllipsis,
} from "@fortawesome/free-solid-svg-icons";
import { useAuthStore } from "@/store/auth-store";
import { useNotificationStore } from "@/store/notification-store";
import { useChatStore } from "@/store/chat-store";
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { colors } from "@/constants/tokens";
import { type IconDefinition } from "@fortawesome/fontawesome-svg-core";

const TAB_ICONS: Record<string, IconDefinition> = {
  home: faHouse,
  schedule: faCalendar,
  route: faRoute,
  messages: faComment,
  more: faEllipsis,
};

const TAB_LABELS: Record<string, string> = {
  home: "Home",
  schedule: "Schedule",
  route: "Route",
  messages: "Messages",
  more: "More",
};

export function CustomTabBar({
  state,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const userRole = useAuthStore((s) => s.user?.role);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const chatUnreadCount = useChatStore((s) => s.totalUnreadCount);

  return (
    <BlurView
      intensity={40}
      tint="dark"
      style={[
        styles.container,
        {
          height: 80 + insets.bottom,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          // Expo Router uses "home/index" format; strip "/index" for label/icon lookup
          const routeName = route.name.replace(/\/index$/, "");

          // Role-based: OWNER sees "Jobs" (briefcase) for the route tab
          const icon =
            routeName === "route" && userRole === "OWNER"
              ? faBriefcase
              : (TAB_ICONS[routeName] ?? faHouse);

          const label =
            routeName === "route" && userRole === "OWNER"
              ? "Jobs"
              : (TAB_LABELS[routeName] ?? routeName);

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabItem
              key={route.key}
              icon={icon}
              label={label}
              isFocused={isFocused}
              onPress={onPress}
              badge={
                routeName === "more"
                  ? unreadCount
                  : routeName === "messages"
                    ? chatUnreadCount
                    : 0
              }
            />
          );
        })}
      </View>
    </BlurView>
  );
}

function TabItem({
  icon,
  label,
  isFocused,
  onPress,
  badge,
}: {
  icon: IconDefinition;
  label: string;
  isFocused: boolean;
  onPress: () => void;
  badge: number;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isFocused ? 1 : 0.5, { duration: 250 }),
  }));

  const dotStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withTiming(isFocused ? 1 : 0, {
          duration: 250,
          easing: Easing.out(Easing.ease),
        }),
      },
    ],
  }));

  return (
    <Pressable onPress={onPress} style={styles.tabItem}>
      <Animated.View style={[styles.tabContent, animatedStyle]}>
        <View>
          <FontAwesomeIcon
            icon={icon}
            size={22}
            color={isFocused ? colors.tab.active : colors.tab.inactive}
          />
          {badge > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.tabLabel,
            {
              color: isFocused ? colors.tab.active : colors.tab.inactive,
            },
          ]}
        >
          {label}
        </Text>
      </Animated.View>
      <Animated.View style={[styles.dot, dotStyle]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.glass.bg,
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
  },
  tabRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    height: 80,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  tabContent: {
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 4,
    fontFamily: "PlusJakartaSans",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: "#EF4444",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.tab.active,
    marginTop: 2,
  },
});
