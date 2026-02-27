import React, { useState } from "react";
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
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { carrierRequestApi } from "../../api/endpoints";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
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
          "Permission Denied",
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
        "Location Error",
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
        "🚚 Request Submitted!",
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
        "Submission Failed",
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
      <Text className="text-gray-700 font-medium mb-2">
        {label} {required && <Text className="text-red-500">*</Text>}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className={`bg-white border rounded-xl px-4 py-3.5 text-gray-900 ${multiline ? "h-24" : ""} ${errors[name] ? "border-red-400" : "border-gray-200"}`}
            placeholder={placeholder}
            placeholderTextColor="#9ca3af"
            value={value as string}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType={keyboardType}
            multiline={multiline}
            textAlignVertical={multiline ? "top" : "center"}
            maxLength={name === "mobile" ? 10 : undefined}
          />
        )}
      />
      {errors[name] && (
        <Text className="text-red-500 text-xs mt-1">
          {(errors[name] as any)?.message}
        </Text>
      )}
    </View>
  );

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
          <View className="bg-orange-500 rounded-2xl p-5 mb-6">
            <View className="flex-row items-center">
              <Text className="text-3xl mr-3">🚚</Text>
              <View>
                <Text className="text-white font-bold text-xl">
                  Carrier Service
                </Text>
                <Text className="text-orange-100 text-sm">We come to you</Text>
              </View>
            </View>
          </View>

          <InputField
            label="Your Name"
            name="name"
            placeholder="Enter your full name"
            required
          />
          <InputField
            label="Mobile Number"
            name="mobile"
            placeholder="10-digit mobile number"
            keyboardType="phone-pad"
            required
          />

          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-gray-700 font-medium">
                Pickup Address <Text className="text-red-500">*</Text>
              </Text>
              <TouchableOpacity
                className={`flex-row items-center px-3 py-1.5 rounded-full border ${coords ? "bg-green-50 border-green-300" : "bg-primary-50 border-primary-300"}`}
                onPress={handleGetLocation}
                disabled={locationLoading}
                activeOpacity={0.8}
              >
                {locationLoading ? (
                  <ActivityIndicator size="small" color="#2563eb" />
                ) : (
                  <>
                    <Text className="text-sm mr-1">{coords ? "✅" : "📍"}</Text>
                    <Text
                      className={`text-xs font-medium ${coords ? "text-green-700" : "text-primary-700"}`}
                    >
                      {coords ? "Location Set" : "Use My Location"}
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
                  className={`bg-white border rounded-xl px-4 py-3.5 text-gray-900 h-24 ${errors.address ? "border-red-400" : "border-gray-200"}`}
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
            {errors.address && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.address.message}
              </Text>
            )}
          </View>

          <InputField
            label="Additional Notes"
            name="notes"
            placeholder="e.g. Near landmark, gate code..."
            multiline
          />

          <TouchableOpacity
            className={`rounded-2xl py-4 items-center mt-2 ${mutation.isPending ? "bg-orange-400" : "bg-orange-500"}`}
            onPress={handleSubmit(onSubmit)}
            disabled={mutation.isPending}
            activeOpacity={0.8}
          >
            {mutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">
                Submit Carrier Request
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-4 items-center py-3"
            onPress={() => navigation.navigate("MyCarrierRequests")}
            activeOpacity={0.8}
          >
            <Text className="text-primary-600 font-medium">
              View My Carrier Requests →
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CarrierRequestFormScreen;
