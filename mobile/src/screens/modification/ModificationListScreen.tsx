import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { modItemApi } from "../../api/endpoints";
import { ModificationItem } from "../../types";

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

  const handleSearchSubmit = () => setDebouncedSearch(search);

  const renderItem = ({ item }: { item: ModificationItem }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("ModificationDetail", { id: item._id })
      }
      className="bg-white mx-4 mb-3 rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      activeOpacity={0.7}
    >
      <View className="p-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <Text
              className="text-gray-900 font-bold text-base"
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text className="text-gray-500 text-xs mt-0.5">
              {item.brand} • {item.category}
            </Text>
          </View>
          <View
            className={`px-2 py-1 rounded-full ${item.isAvailable ? "bg-green-100" : "bg-red-100"}`}
          >
            <Text
              className={`text-xs font-medium ${item.isAvailable ? "text-green-700" : "text-red-700"}`}
            >
              {item.isAvailable ? "In Stock" : "Out of Stock"}
            </Text>
          </View>
        </View>
        <Text
          className="text-gray-500 text-sm mt-2 leading-relaxed"
          numberOfLines={2}
        >
          {item.description}
        </Text>
        {item.tags.length > 0 && (
          <View className="flex-row flex-wrap gap-1 mt-2">
            {item.tags.slice(0, 3).map((tag) => (
              <View key={tag} className="bg-gray-100 px-2 py-0.5 rounded-full">
                <Text className="text-gray-500 text-xs">#{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-primary-900 px-4 pb-4 pt-4">
        <Text className="text-white text-xl font-bold mb-3">
          Modification Parts
        </Text>
        <View className="flex-row gap-2">
          <TextInput
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearchSubmit}
            placeholder="Search parts..."
            placeholderTextColor="#9ca3af"
            returnKeyType="search"
            className="flex-1 bg-white rounded-xl px-4 py-2.5 text-sm text-gray-900"
          />
          <TouchableOpacity
            onPress={handleSearchSubmit}
            className="bg-primary-600 px-4 rounded-xl items-center justify-center"
          >
            <Text className="text-white font-medium">Go</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category filter */}
      {categories && categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="py-3 px-4 bg-white border-b border-gray-100"
        >
          <TouchableOpacity
            onPress={() => setSelectedCategory("")}
            className={`px-3 py-1.5 rounded-full mr-2 ${!selectedCategory ? "bg-primary-600" : "bg-gray-100"}`}
          >
            <Text
              className={`text-xs font-medium ${!selectedCategory ? "text-white" : "text-gray-600"}`}
            >
              All
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() =>
                setSelectedCategory(cat === selectedCategory ? "" : cat)
              }
              className={`px-3 py-1.5 rounded-full mr-2 ${selectedCategory === cat ? "bg-primary-600" : "bg-gray-100"}`}
            >
              <Text
                className={`text-xs font-medium ${selectedCategory === cat ? "text-white" : "text-gray-600"}`}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text className="text-gray-400 text-base">No items found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default ModificationListScreen;
