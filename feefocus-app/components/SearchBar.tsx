import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

interface SearchBarProps {
  showSearch: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleSearch: (show: boolean) => void;
  placeholder?: string;
}

export default function SearchBar({
  showSearch,
  searchQuery,
  onSearchChange,
  onToggleSearch,
  placeholder = "Search...",
}: SearchBarProps) {
  return (
    <View className="flex-row justify-between px-4 pt-14 pb-4 bg-[#f6f6f8]">
      {showSearch ? (
        <View className="flex-1 flex-row items-center gap-2">
          <View
            className="flex-1 h-10 rounded-full px-4 flex-row items-center"
            style={{
              backgroundColor: "white",
              borderWidth: 1,
              borderColor: Colors.border.light,
            }}
          >
            <Ionicons name="search" size={18} color={Colors.text.secondary} />
            <TextInput
              className="flex-1 text-base font-medium pb-2 min-h-14 ml-2"
              style={{ color: Colors.text.primary }}
              placeholder={placeholder}
              placeholderTextColor={Colors.text.tertiary}
              value={searchQuery}
              onChangeText={onSearchChange}
              autoFocus
            />
          </View>
          <TouchableOpacity
            onPress={() => {
              onToggleSearch(false);
              onSearchChange("");
            }}
            className="w-10 h-10 rounded-full bg-gray-200/50 items-center justify-center"
          >
            <Ionicons name="close" size={20} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text className="text-lg font-extrabold text-gray-900 tracking-tight">
            FeeFocus
          </Text>
          <TouchableOpacity
            onPress={() => onToggleSearch(true)}
            className="w-10 h-10 rounded-full bg-gray-200/50 items-center justify-center"
          >
            <Ionicons name="search" size={20} color={Colors.text.primary} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
