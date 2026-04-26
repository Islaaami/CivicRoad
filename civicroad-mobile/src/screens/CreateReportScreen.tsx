import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import MapView, { MapPressEvent, Marker } from "react-native-maps";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient, { apiBaseUrl } from "../api/client";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";
import { AppStackParamList } from "../navigation/AppNavigator";
import { AppTabParamList } from "../navigation/MainTabNavigator";
import { defaultCoordinates } from "../utils/format";
import { Category, Report } from "../utils/types";
import { colors, shadows } from "../utils/theme";

type Props = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, "Create">,
  NativeStackScreenProps<AppStackParamList>
>;

type SelectedImage = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
};

const mapRegionDelta = {
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

function CreateReportScreen({ navigation }: Props) {
  const { user } = useAuth();
  const mapRef = useRef<MapView | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [requestingLocation, setRequestingLocation] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [coordinate, setCoordinate] = useState(defaultCoordinates);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoadingCategories(true);
      const response = await apiClient.get<Category[]>("/categories");
      setCategories(response.data);
      if (response.data.length) {
        setSelectedCategoryId(response.data[0].id);
      }
    } catch (error: any) {
      Alert.alert(
        "Unable to load categories",
        error.response?.data?.message || "Please check the local API."
      );
    } finally {
      setLoadingCategories(false);
    }
  }

  function updateSelectedImage(asset: ImagePicker.ImagePickerAsset) {
    if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
      Alert.alert("Image too large", "Please choose an image that is 5MB or smaller.");
      return;
    }

    setSelectedImage({
      uri: asset.uri,
      fileName: asset.fileName,
      mimeType: asset.mimeType,
      fileSize: asset.fileSize,
    });
  }

  async function handleChooseFromGallery() {
    setPickerVisible(false);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow photo access to attach an image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      updateSelectedImage(result.assets[0]);
    }
  }

  async function handleTakePhoto() {
    setPickerVisible(false);

    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow camera access to take a report photo.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      updateSelectedImage(result.assets[0]);
    }
  }

  function handleMapPress(event: MapPressEvent) {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setCoordinate({ latitude, longitude });
  }

  function focusMap(latitude: number, longitude: number) {
    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        ...mapRegionDelta,
      },
      500
    );
  }

  async function handleUseCurrentLocation() {
    try {
      setRequestingLocation(true);
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please allow location access to center the map on your current position."
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const nextCoordinate = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setShowUserLocation(true);
      setCoordinate(nextCoordinate);
      focusMap(nextCoordinate.latitude, nextCoordinate.longitude);
    } catch {
      Alert.alert(
        "Unable to get location",
        "Please try again or place the marker manually on the map."
      );
    } finally {
      setRequestingLocation(false);
    }
  }

  function getUploadUri(uri: string) {
    return uri;
  }

  function getImageName() {
    if (selectedImage?.fileName?.trim()) {
      return selectedImage.fileName;
    }

    const uriFileName = selectedImage?.uri.split("/").pop();

    if (uriFileName) {
      return uriFileName;
    }

    return `report-${Date.now()}.jpg`;
  }

  async function handleSubmit() {
    if (!title.trim() || !description.trim() || !selectedCategoryId) {
      Alert.alert("Missing information", "Please complete the title, description, and category.");
      return;
    }

    if (!selectedImage) {
      Alert.alert("Missing photo", "Please attach an image before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category_id", String(selectedCategoryId));
      formData.append("latitude", String(coordinate.latitude));
      formData.append("longitude", String(coordinate.longitude));
      formData.append("citizen_id", String(user?.id || ""));
      formData.append("image", {
        uri: getUploadUri(selectedImage.uri),
        name: getImageName(),
        type: selectedImage.mimeType || "image/jpeg",
      } as any);

      const response = await fetch(`${apiBaseUrl}/reports`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      const rawBody = await response.text();
      let parsedBody: Report | { message?: string } | null = null;

      if (rawBody) {
        try {
          parsedBody = JSON.parse(rawBody);
        } catch {
          parsedBody = null;
        }
      }

      if (!response.ok) {
        throw new Error(
          (parsedBody && "message" in parsedBody ? parsedBody.message : null) ||
            "Please try again."
        );
      }

      navigation.navigate("ReportDetail", {
        reportId: (parsedBody as Report).id,
      });
    } catch (error: any) {
      Alert.alert(
        "Unable to create report",
        error.message ||
          `Please try again. If the issue continues, confirm the API is reachable at ${apiBaseUrl}.`
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Issue details</Text>
            <Input
              label="Title"
              onChangeText={setTitle}
              placeholder="Pothole blocking the right lane"
              value={title}
            />
            <Input
              label="Description"
              multiline
              onChangeText={setDescription}
              placeholder="Describe what is happening and why it needs attention."
              value={description}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            {loadingCategories ? (
              <Text style={styles.sectionText}>Loading categories...</Text>
            ) : (
              <View style={styles.chipWrap}>
                {categories.map((category) => {
                  const selected = category.id === selectedCategoryId;

                  return (
                    <Pressable
                      key={category.id}
                      onPress={() => setSelectedCategoryId(category.id)}
                      style={[styles.chip, selected ? styles.chipSelected : null]}
                    >
                      <Text style={[styles.chipText, selected ? styles.chipTextSelected : null]}>
                        {category.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photo</Text>
            <Text style={styles.sectionText}>
              Add a report photo from your camera or gallery. Image size must be 5MB or smaller.
            </Text>
            <Button
              onPress={() => setPickerVisible(true)}
              title={selectedImage ? "Change Photo" : "Add Photo"}
              variant="secondary"
            />
            {selectedImage ? (
              <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
            ) : null}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.sectionText}>
              Tap anywhere on the map or drag the marker to adjust the report location.
            </Text>
            <Button
              loading={requestingLocation}
              onPress={handleUseCurrentLocation}
              title="Use My Location"
              variant="secondary"
            />
            <MapView
              ref={mapRef}
              initialRegion={{
                ...coordinate,
                ...mapRegionDelta,
              }}
              onPress={handleMapPress}
              showsUserLocation={showUserLocation}
              style={styles.map}
            >
              <Marker
                coordinate={coordinate}
                draggable
                onDragEnd={(event) => setCoordinate(event.nativeEvent.coordinate)}
                title="Selected issue location"
              />
            </MapView>
          </View>

          <Button loading={submitting} onPress={handleSubmit} title="Submit Report" />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
        transparent
        visible={pickerVisible}
      >
        <View style={styles.modalBackdrop}>
          <Pressable onPress={() => setPickerVisible(false)} style={StyleSheet.absoluteFillObject} />
          <View style={styles.sheetCard}>
            <Text style={styles.sheetTitle}>Add report photo</Text>
            <Text style={styles.sheetText}>
              Choose whether you want to capture a new photo or use one from your gallery.
            </Text>

            <Pressable onPress={handleTakePhoto} style={styles.sheetAction}>
              <View style={styles.sheetIconWrap}>
                <Ionicons color={colors.primaryDark} name="camera-outline" size={20} />
              </View>
              <View style={styles.sheetCopy}>
                <Text style={styles.sheetActionTitle}>Take Photo</Text>
                <Text style={styles.sheetActionText}>Open the camera and capture the issue.</Text>
              </View>
            </Pressable>

            <Pressable onPress={handleChooseFromGallery} style={styles.sheetAction}>
              <View style={styles.sheetIconWrap}>
                <Ionicons color={colors.primaryDark} name="images-outline" size={20} />
              </View>
              <View style={styles.sheetCopy}>
                <Text style={styles.sheetActionTitle}>Choose from Gallery</Text>
                <Text style={styles.sheetActionText}>Pick an existing image from your device.</Text>
              </View>
            </Pressable>

            <Button onPress={() => setPickerVisible(false)} title="Cancel" variant="secondary" />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 18,
    gap: 16,
  },
  section: {
    gap: 12,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 18,
    ...shadows.card,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  sectionText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipSelected: {
    backgroundColor: "#f5e8da",
    borderColor: "#ebc7a8",
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
  },
  chipTextSelected: {
    color: colors.primaryDark,
  },
  previewImage: {
    width: "100%",
    height: 220,
    borderRadius: 22,
    backgroundColor: "#e5e7eb",
  },
  map: {
    height: 260,
    borderRadius: 22,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(24, 33, 47, 0.42)",
    padding: 18,
  },
  sheetCard: {
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 20,
    gap: 14,
    ...shadows.card,
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  sheetText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  sheetAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fffaf3",
    padding: 16,
  },
  sheetIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5e8da",
  },
  sheetCopy: {
    flex: 1,
    gap: 4,
  },
  sheetActionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  sheetActionText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  coordinateRow: {
    flexDirection: "row",
    gap: 12,
  },
  coordinateCard: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: "#fffaf3",
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 6,
  },
  coordinateLabel: {
    color: colors.textMuted,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  coordinateValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
});

export default CreateReportScreen;
