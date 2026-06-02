import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { repairSlotApi } from "../../api/endpoints";
import { RepairSlot } from "../../types";
import { EmptyState, LoadingState, ScreenHero, StatusPill } from "../../components/ui/MobileUI";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const groupByDate = (
  slots: RepairSlot[],
): { date: string; slots: RepairSlot[] }[] => {
  const map = new Map<string, RepairSlot[]>();
  slots.forEach((slot) => {
    const list = map.get(slot.date) || [];
    list.push(slot);
    map.set(slot.date, list);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, slots]) => ({
      date,
      slots: slots.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot)),
    }));
};

const formatDate = (date: string) => {
  const [year, month, day] = date.split("-");
  const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
  return dateObj.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

const RepairSlotsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [selectedDate] = useState<string>("");

  const { data: slots = [], isLoading } = useQuery<RepairSlot[]>({
    queryKey: ["repair-slots-available", selectedDate],
    queryFn: () =>
      repairSlotApi
        .getAvailable(selectedDate || undefined)
        .then((r) => r.data.data),
  });

  const grouped = groupByDate(slots.filter((slot) => slot.isAvailable));

  const handleBook = (slot: RepairSlot) => {
    navigation.navigate("RepairBookingForm", {
      slotId: slot._id,
      date: slot.date,
      timeSlot: slot.timeSlot,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHero
        eyebrow="Repair"
        title="Repair Slots"
        subtitle="Choose a time that works for you and tell us what needs attention."
        icon="construct-outline"
        accent="orange"
      >
        <TouchableOpacity
          className="bg-white/15 border border-white/20 rounded-2xl px-4 py-3 flex-row items-center justify-between"
          onPress={() => navigation.navigate("MyBookings")}
          activeOpacity={0.85}
        >
          <View className="flex-row items-center">
            <Ionicons name="reader-outline" size={19} color="#fff" />
            <Text className="text-white font-semibold ml-2">My bookings</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </ScreenHero>

      {isLoading ? (
        <LoadingState color="#f97316" />
      ) : grouped.length === 0 ? (
        <EmptyState
          icon="calendar-clear-outline"
          title="No available slots"
          message="There are no repair appointments open right now. Please check back later."
          accent="orange"
        />
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={(item) => item.date}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <View className="px-4 mb-4">
              <View className="flex-row items-center mb-3">
                <View className="h-10 w-10 rounded-2xl bg-orange-50 border border-orange-100 items-center justify-center mr-3">
                  <Ionicons name="calendar-outline" size={19} color="#ea580c" />
                </View>
                <View>
                  <Text className="text-gray-950 font-bold">
                    {formatDate(item.date)}
                  </Text>
                  <Text className="text-gray-400 text-xs">
                    {item.slots.length} slots available
                  </Text>
                </View>
              </View>

              {item.slots.map((slot) => (
                <View
                  key={slot._id}
                  className="bg-white border border-gray-100 rounded-3xl p-4 mb-3 shadow-sm"
                >
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center flex-1 mr-3">
                      <View className="h-11 w-11 rounded-2xl bg-gray-50 items-center justify-center mr-3">
                        <Ionicons name="time-outline" size={22} color="#4b5563" />
                      </View>
                      <View>
                        <Text className="text-gray-950 font-bold text-base">
                          {slot.timeSlot}
                        </Text>
                        <Text className="text-gray-400 text-xs mt-0.5">
                          {slot.currentBookings} of {slot.maxBookings} booked
                        </Text>
                      </View>
                    </View>
                    <StatusPill label="Available" tone="green" />
                  </View>

                  <TouchableOpacity
                    className="bg-orange-500 rounded-2xl py-3 items-center"
                    onPress={() => handleBook(slot)}
                    activeOpacity={0.85}
                  >
                    <Text className="text-white font-bold text-sm">
                      Book this slot
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default RepairSlotsScreen;
