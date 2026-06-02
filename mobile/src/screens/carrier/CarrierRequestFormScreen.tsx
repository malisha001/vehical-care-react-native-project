import React, { useState } from "react";
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
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { carrierRequestApi } from "../../api/endpoints";
import { ScreenHero } from "../../components/ui/MobileUI";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => /^\d{10}$/.test(value), {
      message: "Enter a valid 10-digit mobile number",
    }),
  address: z.string().min(5, "Please enter a full address"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const CarrierRequestFormScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [locationLoading, setLocationLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", mobile: "", address: "", notes: "" },
  });

  const handleGetLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Location permission is required to auto-fill your coordinates.",
        );
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = location.coords;
      setCoords({ lat: latitude, lng: longitude });

      const [geo] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geo) {
        const parts = [
          geo.streetNumber,
          geo.street,
          geo.district,
          geo.city,
          geo.region,
        ].filter(Boolean);
        setValue("address", parts.join(", "));
      }
    } catch (err) {
      Alert.alert(
        "Location error",
        "Could not retrieve your location. Please enter address manually.",
      );
    } finally {
      setLocationLoading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      carrierRequestApi.create({
        ...data,
        coordinates: coords || { lat: 0, lng: 0 },
      }),
    onSuccess: () => {
      Alert.alert(
        "Request submitted",
        "Your carrier request has been submitted. Our team will reach you shortly.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("MyCarrierRequests"),
          },
        ],
      );
    },
    onError: (error: any) => {
      Alert.alert(
        "Submission failed",
        error?.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  const InputField = ({
    label,
    name,
    placeholder,
    keyboardType = "default",
    multiline = false,
    required = false,
  }: {
    label: string;
    name: keyof FormData;
    placeholder: string;
    keyboardType?: any;
    multiline?: boolean;
    required?: boolean;
  }) => (
    <View className="mb-4">
      <Text className="text-gray-700 font-semibold mb-2">
        {label} {required ? <Text className="text-red-500">*</Text> : null}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className={`bg-gray-50 border rounded-2xl px-4 py-3.5 text-gray-900 ${
              multiline ? "h-24" : ""
            } ${errors[name] ? "border-red-400" : "border-gray-100"}`}
            placeholder={placeholder}
            placeholderTextColor="#9ca3af"
            value={value as string}
            onChangeText={(text) => {
              onChange(
                name === "mobile"
                  ? text.replace(/\D/g, "").slice(0, 10)
                  : text,
              );
            }}
            onBlur={onBlur}
            keyboardType={keyboardType}
            multiline={multiline}
            textAlignVertical={multiline ? "top" : "center"}
            maxLength={name === "mobile" ? 10 : undefined}
          />
        )}
      />
      {errors[name] ? (
        <Text className="text-red-500 text-xs mt-1">
          {(errors[name] as any)?.message}
        </Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <ScreenHero
            eyebrow="Carrier"
            title="Request Carrier Service"
            subtitle="Share your pickup details and our team will reach you shortly."
            icon="car-outline"
            accent="green"
          />

          <View className="mx-4 -mt-4 bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
            <InputField
              label="Your name"
              name="name"
              placeholder="Enter your full name"
              required
            />
            <InputField
              label="Mobile number"
              name="mobile"
              placeholder="10-digit mobile number"
              keyboardType="phone-pad"
              required
            />

            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-700 font-semibold">
                  Pickup address <Text className="text-red-500">*</Text>
                </Text>
                <TouchableOpacity
                  className={`flex-row items-center px-3 py-1.5 rounded-full border ${
                    coords
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-primary-50 border-primary-100"
                  }`}
                  onPress={handleGetLocation}
                  disabled={locationLoading}
                  activeOpacity={0.85}
                >
                  {locationLoading ? (
                    <ActivityIndicator size="small" color="#2563eb" />
                  ) : (
                    <>
                      <Ionicons
                        name={coords ? "checkmark" : "locate-outline"}
                        size={14}
                        color={coords ? "#047857" : "#2563eb"}
                      />
                      <Text
                        className={`text-xs font-bold ml-1 ${
                          coords ? "text-emerald-700" : "text-primary-700"
                        }`}
                      >
                        {coords ? "Location set" : "Use location"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
              <Controller
                control={control}
                name="address"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`bg-gray-50 border rounded-2xl px-4 py-3.5 text-gray-900 h-24 ${
                      errors.address ? "border-red-400" : "border-gray-100"
                    }`}
                    placeholder="Enter your full pickup address..."
                    placeholderTextColor="#9ca3af"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    textAlignVertical="top"
                  />
                )}
              />
              {errors.address ? (
                <Text className="text-red-500 text-xs mt-1">
                  {errors.address.message}
                </Text>
              ) : null}
            </View>

            <InputField
              label="Additional notes"
              name="notes"
              placeholder="e.g. Near landmark, gate code..."
              multiline
            />

            <TouchableOpacity
              className={`rounded-2xl py-4 items-center mt-1 ${
                mutation.isPending ? "bg-emerald-400" : "bg-emerald-600"
              }`}
              onPress={handleSubmit(onSubmit)}
              disabled={mutation.isPending}
              activeOpacity={0.85}
            >
              {mutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">
                  Submit carrier request
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-4 items-center py-3 flex-row justify-center"
              onPress={() => navigation.navigate("MyCarrierRequests")}
              activeOpacity={0.85}
            >
              <Text className="text-primary-600 font-bold mr-1">
                View my carrier requests
              </Text>
              <Ionicons name="arrow-forward" size={15} color="#2563eb" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CarrierRequestFormScreen;
