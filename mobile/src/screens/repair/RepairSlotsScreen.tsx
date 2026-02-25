import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { repairSlotApi } from "../../api/endpoints";
import { RepairSlot } from "../../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TIME_SLOTS = [
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
];

const groupByDate = (
  slots: RepairSlot[],
): { date: string; slots: RepairSlot[] }[] => {
  const map = new Map<string, RepairSlot[]>();
  slots.forEach((s) => {
    const list = map.get(s.date) || [];
    list.push(s);
    map.set(s.date, list);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, slots]) => ({ date, slots }));
};

const RepairSlotsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [selectedDate, setSelectedDate] = useState<string>("");

  const {
    data: slots = [],
    isLoading,
    refetch,
  } = useQuery<RepairSlot[]>({
    queryKey: ["repair-slots-available", selectedDate],
    queryFn: () =>
      repairSlotApi
        .getAvailable(selectedDate ? { date: selectedDate } : {})
        .then((r) => r.data.data),
  });

  const grouped = groupByDate(slots.filter((s) => s.isAvailable));

  const handleBook = (slot: RepairSlot) => {
    navigation.navigate("RepairBookingForm", {
      slotId: slot._id,
      date: slot.date,
      timeSlot: slot.timeSlot,
    });
  };

  const renderSlot = ({ item }: { item: RepairSlot }) => (
    <View className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Text className="text-xl mr-2">🕐</Text>
          <Text className="text-gray-900 font-semibold text-base">
            {item.timeSlot}
          </Text>
        </View>
        <View className="bg-green-100 px-3 py-1 rounded-full">
          <Text className="text-green-700 text-xs font-medium">Available</Text>
        </View>
      </View>
      <TouchableOpacity
        className="bg-primary-600 rounded-xl py-3 items-center mt-1"
        onPress={() => handleBook(item)}
        activeOpacity={0.8}
      >
        <Text className="text-white font-bold text-sm">Book This Slot</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGroup = ({
    item,
  }: {
    item: { date: string; slots: RepairSlot[] };
  }) => {
    const [year, month, day] = item.date.split("-");
    const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
    const displayDate = dateObj.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    return (
      <View className="mb-4">
        <View className="bg-primary-50 border-l-4 border-primary-600 px-4 py-2 mb-3 rounded-r-lg">
          <Text className="text-primary-800 font-bold">{displayDate}</Text>
        </View>
        {item.slots.map((s) => (
          <View key={s._id}>{renderSlot({ item: s }).props.children}</View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 pt-4">
        <Text className="text-2xl font-bold text-gray-900 mb-1">
          Repair Slots
        </Text>
        <Text className="text-gray-500 text-sm mb-4">
          Book an available repair appointment
        </Text>

        <TouchableOpacity
          className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4 flex-row items-center justify-between"
          onPress={() => navigation.navigate("MyBookings")}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center">
            <Text className="text-lg mr-2">📋</Text>
            <Text className="text-gray-700 font-medium">My Bookings</Text>
          </View>
          <Text className="text-gray-400">›</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : grouped.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">📅</Text>
          <Text className="text-gray-600 font-semibold text-lg text-center">
            No Available Slots
          </Text>
          <Text className="text-gray-400 text-sm text-center mt-2">
            There are no available repair slots. Please check back later.
          </Text>
        </View>
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={(item) => item.date}
          renderItem={({ item }) => (
            <View className="px-4 mb-2">
              <View className="bg-primary-50 border-l-4 border-primary-600 px-4 py-2 mb-3 rounded-r-lg">
                <Text className="text-primary-800 font-bold">
                  {(() => {
                    const [y, m, d] = item.date.split("-");
                    const obj = new Date(Number(y), Number(m) - 1, Number(d));
                    return obj.toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    });
                  })()}
                </Text>
              </View>
              {item.slots.map((s) => (
                <View
                  key={s._id}
                  className="bg-white border border-gray-200 rounded-xl p-4 mb-3"
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                      <Text className="text-xl mr-2">🕐</Text>
                      <Text className="text-gray-900 font-semibold text-base">
                        {s.timeSlot}
                      </Text>
                    </View>
                    <View className="bg-green-100 px-3 py-1 rounded-full">
                      <Text className="text-green-700 text-xs font-medium">
                        Available
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    className="bg-primary-600 rounded-xl py-3 items-center"
                    onPress={() => handleBook(s)}
                    activeOpacity={0.8}
                  >
                    <Text className="text-white font-bold text-sm">
                      Book This Slot
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </SafeAreaView>
  );
};

export default RepairSlotsScreen;
