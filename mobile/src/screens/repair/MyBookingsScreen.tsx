import React from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { repairBookingApi } from "../../api/endpoints";
import { RepairBooking } from "../../types";
import {
  EmptyState,
  LoadingState,
  ScreenHero,
  StatusPill,
} from "../../components/ui/MobileUI";

const STATUS_STYLES: Record<
  string,
  { tone: "blue" | "green" | "red" | "yellow"; label: string }
> = {
  REQUESTED: { tone: "yellow", label: "Under review" },
  PROPOSED: { tone: "blue", label: "Action needed" },
  ACCEPTED: { tone: "green", label: "Accepted" },
  COMPLETED: { tone: "green", label: "Completed" },
  CANCELLED: { tone: "red", label: "Cancelled" },
};

const MyBookingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const qc = useQueryClient();

  const {
    data: bookings = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<RepairBooking[]>({
    queryKey: ["my-bookings"],
    queryFn: () => repairBookingApi.getMyBookings().then((r) => r.data.data),
  });

  const decisionMutation = useMutation({
    mutationFn: ({
      id,
      decision,
    }: {
      id: string;
      decision: "ACCEPT" | "CANCEL";
    }) => repairBookingApi.respond(id, decision),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
    },
    onError: (error: any) => {
      Alert.alert(
        "Update failed",
        error?.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    },
  });

  const handleDecision = (
    item: RepairBooking,
    decision: "ACCEPT" | "CANCEL",
  ) => {
    const title = decision === "ACCEPT" ? "Accept repair date?" : "Cancel request?";
    const message =
      decision === "ACCEPT"
        ? `Confirm repair for ${item.scheduledDate}?`
        : "This will cancel the repair request.";

    Alert.alert(title, message, [
      { text: "No", style: "cancel" },
      {
        text: decision === "ACCEPT" ? "Accept" : "Cancel request",
        style: decision === "ACCEPT" ? "default" : "destructive",
        onPress: () => decisionMutation.mutate({ id: item._id, decision }),
      },
    ]);
  };

  const renderItem = ({ item }: { item: RepairBooking }) => {
    const status = STATUS_STYLES[item.status] || STATUS_STYLES.REQUESTED;
    return (
      <View className="bg-white border border-gray-100 rounded-3xl p-4 mb-3 mx-4 shadow-sm">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-row flex-1 mr-3">
            <View className="h-12 w-12 rounded-2xl bg-orange-50 items-center justify-center mr-3 border border-orange-100">
              <Ionicons
                name={
                  item.status === "PROPOSED"
                    ? "notifications-outline"
                    : "construct-outline"
                }
                size={22}
                color="#ea580c"
              />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-gray-950">
                Pickup: {item.requestedDate}
              </Text>
              {item.scheduledDate ? (
                <Text className="text-gray-500 text-sm mt-1">
                  Proposed: {item.scheduledDate}
                  {item.estimatedDays ? ` (${item.estimatedDays} days)` : ""}
                </Text>
              ) : (
                <Text className="text-gray-500 text-sm mt-1">
                  Waiting for admin review
                </Text>
              )}
            </View>
          </View>
          <StatusPill label={status.label} tone={status.tone} />
        </View>

        <View className="bg-gray-50 rounded-2xl px-3 py-2 mb-3">
          <Text className="text-gray-700 text-sm font-semibold">
            {item.customerName} - {item.phone}
          </Text>
          {(item.vehiclePlate || item.vehicleModel) ? (
            <Text className="text-gray-500 text-xs mt-1">
              {[item.vehicleModel, item.vehiclePlate].filter(Boolean).join(" - ")}
            </Text>
          ) : null}
        </View>

        <Text numberOfLines={3} className="text-gray-600 text-sm leading-5 mb-2">
          {item.issueDescription}
        </Text>

        {item.adminNotes ? (
          <View className="bg-blue-50 border border-blue-100 rounded-2xl px-3 py-2 mt-1">
            <Text className="text-blue-600 text-xs font-bold mb-0.5">
              Admin note
            </Text>
            <Text className="text-blue-700 text-sm">{item.adminNotes}</Text>
          </View>
        ) : null}

        {item.status === "PROPOSED" ? (
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              className="flex-1 bg-green-500 rounded-2xl py-3 items-center"
              onPress={() => handleDecision(item, "ACCEPT")}
              disabled={decisionMutation.isPending}
              activeOpacity={0.85}
            >
              <Text className="text-white font-bold text-sm">Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-red-500 rounded-2xl py-3 items-center"
              onPress={() => handleDecision(item, "CANCEL")}
              disabled={decisionMutation.isPending}
              activeOpacity={0.85}
            >
              <Text className="text-white font-bold text-sm">Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHero
        eyebrow="Notifications"
        title="Repair Updates"
        subtitle="Review admin date proposals and track your repair requests."
        icon="notifications-outline"
      />

      {isLoading ? (
        <LoadingState />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon="reader-outline"
          title="No repair requests"
          message="You have not sent any repair requests yet."
          actionLabel="Send repair request"
          onAction={() => navigation.navigate("Repair")}
        />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#2563eb"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default MyBookingsScreen;
