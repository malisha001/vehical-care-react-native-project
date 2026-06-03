import React from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
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
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { cleaningBookingApi } from "../../api/endpoints";
import { InfoRow } from "../../components/ui/MobileUI";

type Route = RouteProp<RootStackParamList, "CleaningBookingForm">;

const schema = z.object({
  vehicleModel: z.string().max(100).optional(),
  vehiclePlate: z.string().max(20).optional(),
  notes: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof schema>;

const CleaningBookingFormScreen: React.FC = () => {
  const route = useRoute<Route>();
  const navigation = useNavigation<any>();
  const { serviceId, serviceName, slotId, date, timeSlot } = route.params;

  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { vehicleModel: "", vehiclePlate: "", notes: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      cleaningBookingApi.create({ serviceId, slotId, ...data }),
    onSuccess: () => {
      Alert.alert(
        "Booking submitted",
        `Your ${serviceName} booking has been submitted for ${date} at ${timeSlot}.`,
        [{ text: "OK", onPress: () => navigation.navigate("MyCleaningBookings") }],
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
          <View className="bg-primary-900 rounded-3xl p-5 mb-5 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="h-12 w-12 rounded-2xl bg-primary-600 items-center justify-center mr-3">
                <Ionicons name="water-outline" size={25} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-white/75 text-xs font-semibold uppercase">
                  Cleaning appointment
                </Text>
                <Text className="text-white font-bold text-xl">
                  {serviceName}
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
                Notes
              </Text>
              <Controller
                control={control}
                name="notes"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-gray-900 h-24"
                    placeholder="Any special cleaning requests..."
                    placeholderTextColor="#9ca3af"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    textAlignVertical="top"
                  />
                )}
              />
            </View>

            <TouchableOpacity
              className={`rounded-2xl py-4 items-center ${
                mutation.isPending ? "bg-primary-400" : "bg-primary-600"
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

export default CleaningBookingFormScreen;
