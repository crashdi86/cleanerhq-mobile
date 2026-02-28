import { useCssElement } from "react-native-css";
import {
  View as RNView,
  Text as RNText,
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  TextInput as RNTextInput,
} from "react-native";
import React from "react";

// View
export type ViewProps = React.ComponentProps<typeof RNView> & {
  className?: string;
};

export const View = (props: ViewProps) => {
  return useCssElement(RNView, props, { className: "style" });
};
View.displayName = "CSS(View)";

// Text
export type TextProps = React.ComponentProps<typeof RNText> & {
  className?: string;
};

export const Text = (props: TextProps) => {
  return useCssElement(RNText, props, { className: "style" });
};
Text.displayName = "CSS(Text)";

// ScrollView
export type ScrollViewProps = React.ComponentProps<typeof RNScrollView> & {
  className?: string;
  contentContainerClassName?: string;
};

export const ScrollView = (props: ScrollViewProps) => {
  // @ts-expect-error: useCssElement produces overly complex union type with ScrollView
  return useCssElement(RNScrollView, props, {
    className: "style",
    contentContainerClassName: "contentContainerStyle",
  });
};
ScrollView.displayName = "CSS(ScrollView)";

// Pressable
export type PressableProps = React.ComponentProps<typeof RNPressable> & {
  className?: string;
};

export const Pressable = (props: PressableProps) => {
  return useCssElement(RNPressable, props, { className: "style" });
};
Pressable.displayName = "CSS(Pressable)";

// TextInput
export type TextInputProps = React.ComponentProps<typeof RNTextInput> & {
  className?: string;
};

export const TextInput = (props: TextInputProps) => {
  return useCssElement(RNTextInput, props, { className: "style" });
};
TextInput.displayName = "CSS(TextInput)";
