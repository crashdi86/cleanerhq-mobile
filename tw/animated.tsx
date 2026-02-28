import { useCssElement } from "react-native-css";
import RNAnimated from "react-native-reanimated";
import React from "react";

// Animated View with className support
export const AnimatedView = (
  props: React.ComponentProps<typeof RNAnimated.View> & { className?: string }
) => {
  return useCssElement(RNAnimated.View, props, { className: "style" });
};
AnimatedView.displayName = "CSS(AnimatedView)";

// Animated Text with className support
export const AnimatedText = (
  props: React.ComponentProps<typeof RNAnimated.Text> & { className?: string }
) => {
  return useCssElement(RNAnimated.Text, props, { className: "style" });
};
AnimatedText.displayName = "CSS(AnimatedText)";

// Re-export other animated utilities
export const Animated = {
  ...RNAnimated,
  View: AnimatedView,
  Text: AnimatedText,
};
