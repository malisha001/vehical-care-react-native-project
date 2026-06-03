import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { z } from "zod";
import { repairBookingApi } from "../../api/endpoints";
import { useAuthStore } from "../../store/authStore";
import { ScreenHero } from "../../components/ui/MobileUI";

const schema = z.object({
  customerName: z.string().min(2, "Please enter your name"),
  phone: z.string().min(7, "Please enter a valid phone number").max(20),
  requestedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter pickup date as YYYY-MM-DD"),
  vehicleModel: z.string().max(100).optional(),
  vehiclePlate: z.string().max(20).optional(),
  issueDescription: z
    .string()
    .min(10, "Please describe the repair in at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

const toDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const CALENDAR_DAY_WIDTH = `${100 / 7}%` as const;

const fromDateValue = (value?: string) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const formatDateLabel = (value?: string) => {
  const date = fromDateValue(value);
  if (!date) return "";

  return date.toLocaleDateString("en-LK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const monthTitle = (date: Date) =>
  date.toLocaleDateString("en-LK", { month: "long", year: "numeric" });

const getCalendarDays = (monthDate: Date) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = Array.from({ length: firstDay.getDay() }, () => null);
  const days = Array.from(
    { length: daysInMonth },
    (_, index) => new Date(year, month, index + 1),
  );

  return [...blanks, ...days];
};

const RepairSlotsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const user = useAuthStore((state) => state.user);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const todayValue = useMemo(() => toDateValue(new Date()), []);
  const calendarDays = useMemo(
    () => getCalendarDays(visibleMonth),
    [visibleMonth],
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerName: user?.name || "",
      phone: "",
      requestedDate: "",
      vehicleModel: "",
      vehiclePlate: "",
      issueDescription: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => repairBookingApi.create(data),
    onSuccess: () => {
      reset({
        customerName: user?.name || "",
        phone: "",
        requestedDate: "",
        vehicleModel: "",
        vehiclePlate: "",
        issueDescription: "",
      });
      Alert.alert(
        "Request sent",
        "Your repair request has been sent. The admin will review your pickup date and send you an update.",
        [{ text: "OK", onPress: () => navigation.navigate("MyBookings") }],
      );
    },
    onError: (error: any) => {
      Alert.alert(
        "Request failed",
        error?.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  const moveMonth = (offset: number) => {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScreenHero
          eyebrow="Repair"
          title="Repair Request"
          subtitle="Tell us what needs attention and when you want the vehicle picked up."
          icon="construct-outline"
          accent="orange"
        >
          <TouchableOpacity
            className="bg-white/15 border border-white/20 rounded-2xl px-4 py-3 flex-row items-center justify-between"
            onPress={() => navigation.navigate("MyBookings")}
            activeOpacity={0.85}
          >
            <View className="flex-row items-center">
              <Ionicons name="notifications-outline" size={19} color="#fff" />
              <Text className="text-white font-semibold ml-2">
                Repair notifications
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </ScreenHero>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
            <Text className="text-gray-950 font-bold text-lg mb-4">
              Request details
            </Text>

            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                Name <Text className="text-red-500">*</Text>
              </Text>
              <Controller
                control={control}
                name="customerName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`bg-gray-50 border rounded-2xl px-4 py-3.5 text-gray-900 ${
                      errors.customerName ? "border-red-400" : "border-gray-100"
                    }`}
                    placeholder="Your name"
                    placeholderTextColor="#9ca3af"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
              {errors.customerName ? (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.customerName.message}
                </Text>
              ) : null}
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                Phone number <Text className="text-red-500">*</Text>
              </Text>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`bg-gray-50 border rounded-2xl px-4 py-3.5 text-gray-900 ${
                      errors.phone ? "border-red-400" : "border-gray-100"
                    }`}
                    placeholder="e.g. 0771234567"
                    placeholderTextColor="#9ca3af"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="phone-pad"
                  />
                )}
              />
              {errors.phone ? (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.phone.message}
                </Text>
              ) : null}
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                Pickup date <Text className="text-red-500">*</Text>
              </Text>
              <Controller
                control={control}
                name="requestedDate"
                render={({ field: { onChange, value } }) => (
                  <>
                    <TouchableOpacity
                      className={`bg-gray-50 border rounded-2xl px-4 py-3.5 flex-row items-center justify-between ${
                        errors.requestedDate
                          ? "border-red-400"
                          : "border-gray-100"
                      }`}
                      onPress={() => {
                        const selectedDate = fromDateValue(value);
                        setVisibleMonth(selectedDate || new Date());
                        setIsCalendarOpen(true);
                      }}
                      activeOpacity={0.85}
                    >
                      <View className="flex-row items-center flex-1">
                        <Ionicons
                          name="calendar-outline"
                          size={20}
                          color="#f97316"
                        />
                        <Text
                          className={`ml-3 text-base ${
                            value ? "text-gray-900" : "text-gray-400"
                          }`}
                        >
                          {value ? formatDateLabel(value) : "Select pickup date"}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-down"
                        size={18}
                        color="#9ca3af"
                      />
                    </TouchableOpacity>

                    <Modal
                      visible={isCalendarOpen}
                      transparent
                      animationType="fade"
                      onRequestClose={() => setIsCalendarOpen(false)}
                    >
                      <View className="flex-1 bg-black/40 justify-end">
                        <View className="bg-white rounded-t-3xl p-5">
                          <View className="flex-row items-center justify-between mb-5">
                            <TouchableOpacity
                              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
                              onPress={() => moveMonth(-1)}
                              activeOpacity={0.8}
                            >
                              <Ionicons
                                name="chevron-back"
                                size={20}
                                color="#111827"
                              />
                            </TouchableOpacity>
                            <Text className="text-gray-950 font-bold text-lg">
                              {monthTitle(visibleMonth)}
                            </Text>
                            <TouchableOpacity
                              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
                              onPress={() => moveMonth(1)}
                              activeOpacity={0.8}
                            >
                              <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="#111827"
                              />
                            </TouchableOpacity>
                          </View>

                          <View className="flex-row mb-2">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                              (day) => (
                                <Text
                                  key={day}
                                  className="flex-1 text-center text-xs font-bold text-gray-400"
                                >
                                  {day}
                                </Text>
                              ),
                            )}
                          </View>

                          <View className="flex-row flex-wrap">
                            {calendarDays.map((day, index) => {
                              const dayValue = day ? toDateValue(day) : "";
                              const isSelected = dayValue === value;
                              const isPast = !!day && dayValue < todayValue;

                              return (
                                <View
                                  key={`${dayValue}-${index}`}
                                  className="p-1"
                                  style={{ width: CALENDAR_DAY_WIDTH }}
                                >
                                  {day ? (
                                    <TouchableOpacity
                                      className={`h-10 rounded-full items-center justify-center ${
                                        isSelected
                                          ? "bg-orange-500"
                                          : isPast
                                            ? "bg-gray-50"
                                            : "bg-white"
                                      }`}
                                      disabled={isPast}
                                      onPress={() => {
                                        onChange(dayValue);
                                        setIsCalendarOpen(false);
                                      }}
                                      activeOpacity={0.8}
                                    >
                                      <Text
                                        className={`font-semibold ${
                                          isSelected
                                            ? "text-white"
                                            : isPast
                                              ? "text-gray-300"
                                              : "text-gray-800"
                                        }`}
                                      >
                                        {day.getDate()}
                                      </Text>
                                    </TouchableOpacity>
                                  ) : (
                                    <View className="h-10" />
                                  )}
                                </View>
                              );
                            })}
                          </View>

                          <View className="flex-row gap-3 mt-5">
                            <TouchableOpacity
                              className="flex-1 rounded-2xl py-3.5 items-center bg-gray-100"
                              onPress={() => setIsCalendarOpen(false)}
                              activeOpacity={0.85}
                            >
                              <Text className="text-gray-700 font-bold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              className="flex-1 rounded-2xl py-3.5 items-center bg-orange-500"
                              onPress={() => {
                                const dateValue = toDateValue(new Date());
                                onChange(dateValue);
                                setVisibleMonth(new Date());
                                setIsCalendarOpen(false);
                              }}
                              activeOpacity={0.85}
                            >
                              <Text className="text-white font-bold">Today</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </Modal>
                  </>
                )}
              />
              {errors.requestedDate ? (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.requestedDate.message}
                </Text>
              ) : null}
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                Vehicle model
              </Text>
              <Controller
                control={control}
                name="vehicleModel"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-gray-900"
                    placeholder="e.g. Toyota Aqua"
                    placeholderTextColor="#9ca3af"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                Vehicle plate
              </Text>
              <Controller
                control={control}
                name="vehiclePlate"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-gray-900"
                    placeholder="e.g. WP ABC 1234"
                    placeholderTextColor="#9ca3af"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="characters"
                  />
                )}
              />
            </View>

            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2">
                Description <Text className="text-red-500">*</Text>
              </Text>
              <Controller
                control={control}
                name="issueDescription"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`bg-gray-50 border rounded-2xl px-4 py-3.5 text-gray-900 h-28 ${
                      errors.issueDescription
                        ? "border-red-400"
                        : "border-gray-100"
                    }`}
                    placeholder="Describe the issue with your vehicle..."
                    placeholderTextColor="#9ca3af"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    textAlignVertical="top"
                  />
                )}
              />
              {errors.issueDescription ? (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.issueDescription.message}
                </Text>
              ) : null}
            </View>

            <TouchableOpacity
              className={`rounded-2xl py-4 items-center ${
                mutation.isPending ? "bg-orange-400" : "bg-orange-500"
              }`}
              onPress={handleSubmit(onSubmit)}
              disabled={mutation.isPending}
              activeOpacity={0.85}
            >
              {mutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">
                  Send request
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RepairSlotsScreen;
