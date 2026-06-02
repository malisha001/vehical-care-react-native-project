import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type IconName = keyof typeof Ionicons.glyphMap;

const accentStyles = {
  blue: {
    header: "bg-primary-900",
    soft: "bg-primary-50",
    icon: "bg-primary-600",
    text: "text-primary-700",
    border: "border-primary-100",
    button: "bg-primary-600",
  },
  green: {
    header: "bg-emerald-700",
    soft: "bg-emerald-50",
    icon: "bg-emerald-600",
    text: "text-emerald-700",
    border: "border-emerald-100",
    button: "bg-emerald-600",
  },
  orange: {
    header: "bg-orange-600",
    soft: "bg-orange-50",
    icon: "bg-orange-500",
    text: "text-orange-700",
    border: "border-orange-100",
    button: "bg-orange-500",
  },
  violet: {
    header: "bg-violet-700",
    soft: "bg-violet-50",
    icon: "bg-violet-600",
    text: "text-violet-700",
    border: "border-violet-100",
    button: "bg-violet-600",
  },
};

export type Accent = keyof typeof accentStyles;

export const stylesForAccent = (accent: Accent = "blue") =>
  accentStyles[accent];

const toneColor = {
  blue: "#1d4ed8",
  green: "#047857",
  orange: "#c2410c",
  violet: "#6d28d9",
  red: "#b91c1c",
  yellow: "#a16207",
  gray: "#4b5563",
};

export const ScreenHero = ({
  eyebrow,
  title,
  subtitle,
  icon,
  accent = "blue",
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  icon: IconName;
  accent?: Accent;
  children?: React.ReactNode;
}) => {
  const styles = stylesForAccent(accent);

  return (
    <View className={`${styles.header} px-5 pt-6 pb-7`}>
      <View className="flex-row items-start">
        <View
          className={`h-14 w-14 rounded-2xl ${styles.icon} items-center justify-center mr-4`}
        >
          <Ionicons name={icon} size={26} color="#fff" />
        </View>
        <View className="flex-1">
          {eyebrow ? (
            <Text className="text-white/70 text-xs font-semibold uppercase tracking-wide">
              {eyebrow}
            </Text>
          ) : null}
          <Text className="text-white text-2xl font-bold mt-1">{title}</Text>
          {subtitle ? (
            <Text className="text-white/80 text-sm mt-1 leading-5">
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {children ? <View className="mt-5">{children}</View> : null}
    </View>
  );
};

export const SectionTitle = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) => (
  <View className="px-4 pt-5 pb-3">
    <Text className="text-gray-900 text-xl font-bold">{title}</Text>
    {subtitle ? <Text className="text-gray-500 text-sm mt-1">{subtitle}</Text> : null}
  </View>
);

export const StatusPill = ({
  label,
  tone = "blue",
  icon,
}: {
  label: string;
  tone?: Accent | "red" | "yellow" | "gray";
  icon?: IconName;
}) => {
  const toneMap = {
    blue: "bg-primary-50 text-primary-700 border-primary-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
    violet: "bg-violet-50 text-violet-700 border-violet-100",
    red: "bg-red-50 text-red-700 border-red-100",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-100",
    gray: "bg-gray-50 text-gray-600 border-gray-100",
  };

  return (
    <View
      className={`flex-row items-center rounded-full border px-3 py-1 ${toneMap[tone]}`}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={13}
          color={toneColor[tone]}
          style={{ marginRight: 4 }}
        />
      ) : null}
      <Text className={`text-xs font-semibold ${toneMap[tone].split(" ")[1]}`}>
        {label}
      </Text>
    </View>
  );
};

export const EmptyState = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  accent = "blue",
}: {
  icon: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  accent?: Accent;
}) => {
  const styles = stylesForAccent(accent);

  return (
    <View className="flex-1 items-center justify-center px-8 py-20">
      <View
        className={`h-16 w-16 rounded-3xl ${styles.soft} ${styles.border} border items-center justify-center mb-4`}
      >
        <Ionicons name={icon} size={30} color="#2563eb" />
      </View>
      <Text className="text-gray-800 font-bold text-lg text-center">
        {title}
      </Text>
      <Text className="text-gray-500 text-sm text-center mt-2 leading-5">
        {message}
      </Text>
      {actionLabel && onAction ? (
        <TouchableOpacity
          className={`${styles.button} rounded-2xl px-6 py-3 mt-6`}
          onPress={onAction}
          activeOpacity={0.85}
        >
          <Text className="text-white font-bold">{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export const LoadingState = ({ color = "#2563eb" }: { color?: string }) => (
  <View className="flex-1 items-center justify-center">
    <ActivityIndicator size="large" color={color} />
    <Text className="text-gray-400 text-sm mt-3">Loading...</Text>
  </View>
);

export const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) => (
  <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-3">
    <View className="h-9 w-9 rounded-xl bg-white items-center justify-center mr-3 border border-gray-100">
      <Ionicons name={icon} size={18} color="#64748b" />
    </View>
    <View className="flex-1">
      <Text className="text-gray-400 text-xs font-semibold uppercase">
        {label}
      </Text>
      <Text className="text-gray-800 font-semibold text-sm mt-0.5">{value}</Text>
    </View>
  </View>
);
