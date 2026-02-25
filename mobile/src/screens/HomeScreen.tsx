import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "../navigation/AppNavigator";

type Nav = BottomTabNavigationProp<MainTabParamList>;

const sections = [
  {
    title: "🧹 Vehicle Cleaning",
    subtitle: "Body wash, full service & more",
    tab: "Cleaning" as const,
    color: "bg-blue-50 border-blue-200",
  },
  {
    title: "🔧 Modification",
    subtitle: "Browse modification parts & accessories",
    tab: "Modification" as const,
    color: "bg-purple-50 border-purple-200",
  },
  {
    title: "🔩 Repairing",
    subtitle: "Book a repair appointment",
    tab: "Repair" as const,
    color: "bg-orange-50 border-orange-200",
  },
  {
    title: "🚛 Carrier Service",
    subtitle: "Request a tow or carrier",
    tab: "Carrier" as const,
    color: "bg-green-50 border-green-200",
  },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-primary-900 px-6 pt-8 pb-10">
          <Text className="text-white text-2xl font-bold">Vehicle Service</Text>
          <Text className="text-primary-200 text-base mt-1">
            What can we help you with today?
          </Text>
        </View>

        {/* Section Cards */}
        <View className="px-4 -mt-4">
          <View className="grid grid-cols-2 gap-4">
            {sections.map((section) => (
              <TouchableOpacity
                key={section.tab}
                onPress={() => navigation.navigate(section.tab)}
                className={`rounded-2xl border-2 p-5 mb-3 shadow-sm ${section.color}`}
                activeOpacity={0.7}
              >
                <Text className="text-3xl mb-2">
                  {section.title.split(" ")[0]}
                </Text>
                <Text className="text-gray-900 font-bold text-base leading-snug">
                  {section.title.substring(section.title.indexOf(" ") + 1)}
                </Text>
                <Text className="text-gray-500 text-xs mt-1">
                  {section.subtitle}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info banner */}
        <View className="mx-4 mt-2 mb-6 bg-primary-50 rounded-2xl p-4 border border-primary-100">
          <Text className="text-primary-900 font-semibold">💡 Pro Tip</Text>
          <Text className="text-primary-700 text-sm mt-1">
            Book repair slots early to get your preferred time. Carrier service
            is available 24/7.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
