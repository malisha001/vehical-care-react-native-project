import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { modItemApi } from "../../api/endpoints";
import { ModificationItem } from "../../types";
import { EmptyState, LoadingState, ScreenHero, StatusPill } from "../../components/ui/MobileUI";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ModificationListScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data: items, isLoading } = useQuery({
    queryKey: ["mod-items", debouncedSearch, selectedCategory],
    queryFn: () =>
      modItemApi
        .getAll({
          search: debouncedSearch || undefined,
          category: selectedCategory || undefined,
          limit: 50,
        })
        .then((r) => r.data.data),
  });

  const { data: categories } = useQuery({
    queryKey: ["mod-categories"],
    queryFn: () => modItemApi.getCategories().then((r) => r.data.data),
  });

  const handleSearchSubmit = () => setDebouncedSearch(search.trim());

  const renderItem = ({ item }: { item: ModificationItem }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("ModificationDetail", { id: item._id })
      }
      className="bg-white mx-4 mb-3 rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
      activeOpacity={0.82}
    >
      <View className="p-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-row flex-1 mr-3">
            <View className="h-12 w-12 rounded-2xl bg-violet-50 border border-violet-100 items-center justify-center mr-3">
              <Ionicons name="build-outline" size={23} color="#7c3aed" />
            </View>
            <View className="flex-1">
              <Text
                className="text-gray-950 font-bold text-base"
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>
                {item.brand} - {item.category}
              </Text>
            </View>
          </View>
          <StatusPill
            label={item.isAvailable ? "In stock" : "Out"}
            tone={item.isAvailable ? "green" : "red"}
          />
        </View>

        <Text
          className="text-gray-500 text-sm mt-3 leading-5"
          numberOfLines={2}
        >
          {item.description}
        </Text>

        <View className="flex-row items-center mt-4">
          <View className="bg-gray-50 rounded-full px-3 py-1 flex-row items-center">
            <Ionicons name="cube-outline" size={13} color="#6b7280" />
            <Text className="text-gray-600 text-xs font-semibold ml-1">
              {item.stockQty} available
            </Text>
          </View>
          <View className="ml-auto flex-row items-center">
            <Text className="text-violet-700 text-sm font-bold mr-1">
              Details
            </Text>
            <Ionicons name="arrow-forward" size={15} color="#6d28d9" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScreenHero
        eyebrow="Upgrades"
        title="Modification Parts"
        subtitle="Find parts and accessories that match your vehicle style."
        icon="build-outline"
        accent="violet"
      >
        <View className="flex-row gap-2">
          <View className="flex-1 bg-white rounded-2xl px-4 py-3 flex-row items-center">
            <Ionicons name="search" size={18} color="#9ca3af" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearchSubmit}
              placeholder="Search parts..."
              placeholderTextColor="#9ca3af"
              returnKeyType="search"
              className="flex-1 ml-2 text-sm text-gray-900"
            />
          </View>
          <TouchableOpacity
            onPress={handleSearchSubmit}
            className="bg-white/20 px-4 rounded-2xl items-center justify-center border border-white/20"
            activeOpacity={0.82}
          >
            <Text className="text-white font-bold">Go</Text>
          </TouchableOpacity>
        </View>
      </ScreenHero>

      {categories && categories.length > 0 ? (
        <View className="bg-white border-b border-gray-100">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              gap: 8,
            }}
          >
            {["", ...categories].map((cat) => {
              const label = cat || "All";
              const selected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={label}
                  onPress={() => setSelectedCategory(selected ? "" : cat)}
                  accessibilityRole="button"
                  className={`min-h-9 items-center justify-center rounded-full border px-4 ${
                    selected
                      ? "border-violet-700 bg-violet-700"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selected ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {isLoading ? (
        <LoadingState />
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="build-outline"
              title="No items found"
              message="Try another search term or clear the selected category."
              accent="violet"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default ModificationListScreen;
