import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { repairBookingApi } from "../../api/endpoints";
import { InfoRow } from "../../components/ui/MobileUI";

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
        "Booking confirmed",
        `Your repair appointment has been booked for ${date} at ${timeSlot}. We will confirm shortly.`,
        [{ text: "OK", onPress: () => navigation.navigate("MyBookings") }],
      );
    },
    onError: (error: any) => {
      Alert.alert(
        "Booking failed",
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
          contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="bg-orange-600 rounded-3xl p-5 mb-5 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="h-12 w-12 rounded-2xl bg-orange-500 items-center justify-center mr-3">
                <Ionicons name="construct-outline" size={25} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-white/75 text-xs font-semibold uppercase">
                  Repair appointment
                </Text>
                <Text className="text-white font-bold text-xl">
                  Confirm your slot
                </Text>
              </View>
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <InfoRow icon="calendar-outline" label="Date" value={date} />
              </View>
              <View className="flex-1">
                <InfoRow icon="time-outline" label="Time" value={timeSlot} />
              </View>
            </View>
          </View>

          <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
            <Text className="text-gray-950 font-bold text-lg mb-4">
              Vehicle details
            </Text>

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
              <Text className="text-gray-700 font-semibold mb-2">
                Vehicle plate
              </Text>
              <Controller
                control={control}
                name="vehiclePlate"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-gray-900"
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

            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-2">
                Issue description <Text className="text-red-500">*</Text>
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
                  Confirm booking
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RepairBookingFormScreen;
