import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { MainTabParamList } from "../navigation/AppNavigator";
import { ScreenHero } from "../components/ui/MobileUI";

type Nav = BottomTabNavigationProp<MainTabParamList>;

const sections = [
  {
    title: "Vehicle Cleaning",
    subtitle: "Body wash, full service and more",
    tab: "Cleaning" as const,
    icon: "water-outline" as const,
    color: "bg-blue-50 border-blue-100",
    iconColor: "bg-blue-500",
  },
  {
    title: "Modification",
    subtitle: "Parts, accessories and custom upgrades",
    tab: "Modification" as const,
    icon: "build-outline" as const,
    color: "bg-violet-50 border-violet-100",
    iconColor: "bg-violet-500",
  },
  {
    title: "Repairing",
    subtitle: "Reserve an appointment slot",
    tab: "Repair" as const,
    icon: "construct-outline" as const,
    color: "bg-orange-50 border-orange-100",
    iconColor: "bg-orange-500",
  },
  {
    title: "Carrier Service",
    subtitle: "Request pickup or towing support",
    tab: "Carrier" as const,
    icon: "car-outline" as const,
    color: "bg-emerald-50 border-emerald-100",
    iconColor: "bg-emerald-500",
  },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <ScreenHero
          eyebrow="Service center"
          title="Vehicle Care"
          subtitle="Book repairs, request carrier support, and browse care services from one place."
          icon="car-sport-outline"
        />

        <View className="px-4 -mt-3">
          <View className="flex-row flex-wrap justify-between">
            {sections.map((section) => (
              <TouchableOpacity
                key={section.tab}
                onPress={() => navigation.navigate(section.tab)}
                className={`w-[48%] min-h-40 rounded-3xl border p-4 mb-3 shadow-sm ${section.color}`}
                activeOpacity={0.82}
              >
                <View
                  className={`h-12 w-12 rounded-2xl ${section.iconColor} items-center justify-center mb-4`}
                >
                  <Ionicons name={section.icon} size={24} color="#fff" />
                </View>
                <Text className="text-gray-950 font-bold text-base leading-snug">
                  {section.title}
                </Text>
                <Text className="text-gray-500 text-xs mt-1 leading-4">
                  {section.subtitle}
                </Text>
                <View className="mt-auto pt-4 flex-row items-center">
                  <Text className="text-gray-700 text-xs font-semibold mr-1">
                    Open
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color="#374151" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mx-4 mt-2 mb-6 bg-white rounded-3xl p-4 border border-gray-100 shadow-sm">
          <View className="flex-row items-center mb-2">
            <View className="h-9 w-9 rounded-2xl bg-primary-50 items-center justify-center mr-3">
              <Ionicons name="sparkles-outline" size={18} color="#2563eb" />
            </View>
            <Text className="text-gray-900 font-bold">Today's tip</Text>
          </View>
          <Text className="text-gray-600 text-sm leading-5">
            Book repair slots early to get your preferred time. Carrier service
            is available 24/7.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
