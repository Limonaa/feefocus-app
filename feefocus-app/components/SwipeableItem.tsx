import { View, Text, TouchableOpacity, Dimensions, Alert } from "react-native";
import { ReactNode } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";

const FULL_SWIPE_THRESHOLD = 110;
const MAX_TRANSLATE = 200;

interface SwipeableItemProps {
  children: ReactNode;
  onDelete?: () => void;
  onEdit?: () => void;
}

export default function SwipeableItem({
  children,
  onDelete,
  onEdit,
}: SwipeableItemProps) {
  const translateX = useSharedValue(0);
  const context = useSharedValue({ x: 0 });

  const triggerEdit = () => {
    if (onEdit) {
      onEdit();
    }
  };

  const triggerDelete = () => {
    if (onDelete) {
      Alert.alert(
        "Delete Subscription",
        "Are you sure you want to delete this subscription?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            onPress: onDelete,
            style: "destructive",
          },
        ],
      );
    }
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { x: translateX.value };
    })
    .onUpdate((event) => {
      const newTranslateX = context.value.x + event.translationX;
      if (newTranslateX > 0 && onDelete) {
        translateX.value = Math.min(newTranslateX, MAX_TRANSLATE);
      } else if (newTranslateX < 0 && onEdit) {
        translateX.value = Math.max(newTranslateX, -MAX_TRANSLATE);
      }
    })
    .onEnd(() => {
      const shouldTriggerDelete = translateX.value > FULL_SWIPE_THRESHOLD;
      const shouldTriggerEdit = translateX.value < -FULL_SWIPE_THRESHOLD;

      if (shouldTriggerDelete && onDelete) {
        translateX.value = withTiming(0, { duration: 200 });
        runOnJS(triggerDelete)();
      } else if (shouldTriggerEdit && onEdit) {
        translateX.value = withTiming(0, { duration: 200 });
        runOnJS(triggerEdit)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backgroundStyle = useAnimatedStyle(() => {
    const backgroundColor =
      translateX.value > 5
        ? Colors.error
        : translateX.value < -5
          ? Colors.primary
          : "transparent";

    return {
      backgroundColor,
    };
  });

  return (
    <View className="relative mb-3">
      <Animated.View
        style={[backgroundStyle]}
        className="absolute left-0 right-0 top-0 bottom-0 rounded-2xl flex-row items-center justify-between px-8"
      >
        {onDelete && (
          <View className="items-center">
            <Ionicons name="trash" size={28} color="white" />
            <Text className="text-white text-xs font-bold mt-1">Delete</Text>
          </View>
        )}
        <View />
        {onEdit && (
          <View className="items-center">
            <Ionicons name="pencil" size={28} color="white" />
            <Text className="text-white text-xs font-bold mt-1">Edit</Text>
          </View>
        )}
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}
