import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { repairBookingApi } from "../../api/endpoints";

type Route = RouteProp<RootStackParamList, "RepairBookingForm">;

const schema = z.object({
  vehicleModel: z.string().max(100).optional(),
  vehiclePlate: z.string().max(20).optional(),
  issueDescription: z
    .string()
    .min(10, "Please describe the issue in at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

const RepairBookingFormScreen: React.FC = () => {
  const route = useRoute<Route>();
  const navigation = useNavigation<any>();
  const { slotId, date, timeSlot } = route.params;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { vehicleModel: "", vehiclePlate: "", issueDescription: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      repairBookingApi.create({ slotId, ...data }),
    onSuccess: () => {
      Alert.alert(
        "✅ Booking Confirmed!",
        `Your repair appointment has been booked for ${date} at ${timeSlot}. We will confirm shortly.`,
        [{ text: "OK", onPress: () => navigation.navigate("MyBookings") }],
      );
    },
    onError: (error: any) => {
      Alert.alert(
        "Booking Failed",
        error?.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="bg-primary-600 rounded-2xl p-5 mb-6">
            <View className="flex-row items-center mb-3">
              <Text className="text-3xl mr-3">🔧</Text>
              <Text className="text-white font-bold text-xl">
                Repair Appointment
              </Text>
            </View>
            <View className="bg-primary-500 rounded-xl p-3">
              <View className="flex-row justify-between mb-1">
                <Text className="text-primary-100 text-sm">Date</Text>
                <Text className="text-white font-semibold text-sm">{date}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-primary-100 text-sm">Time</Text>
                <Text className="text-white font-semibold text-sm">
                  {timeSlot}
                </Text>
              </View>
            </View>
          </View>

          <Text className="text-gray-900 font-bold text-lg mb-4">
            Vehicle Details
          </Text>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">
              Vehicle Model (optional)
            </Text>
            <Controller
              control={control}
              name="vehicleModel"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900"
                  placeholder="e.g. Honda City 2020"
                  placeholderTextColor="#9ca3af"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">
              Vehicle Plate (optional)
            </Text>
            <Controller
              control={control}
              name="vehiclePlate"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900"
                  placeholder="e.g. MH 12 AB 1234"
                  placeholderTextColor="#9ca3af"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="characters"
                />
              )}
            />
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">
              Issue Description <Text className="text-red-500">*</Text>
            </Text>
            <Controller
              control={control}
              name="issueDescription"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`bg-white border rounded-xl px-4 py-3.5 text-gray-900 h-28 ${errors.issueDescription ? "border-red-400" : "border-gray-200"}`}
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
            {errors.issueDescription && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.issueDescription.message}
              </Text>
            )}
          </View>

          <TouchableOpacity
            className={`rounded-2xl py-4 items-center ${mutation.isPending ? "bg-primary-400" : "bg-primary-600"}`}
            onPress={handleSubmit(onSubmit)}
            disabled={mutation.isPending}
            activeOpacity={0.8}
          >
            {mutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">
                Confirm Booking
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RepairBookingFormScreen;
