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
import {
  defaultCoordinates,
  formatCategoryName,
} from "../utils/format";
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
  const [formResetKey, setFormResetKey] = useState(0);

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
        "Impossible de charger les catégories",
        error.response?.data?.message ||
          "Veuillez vérifier l'API locale."
      );
    } finally {
      setLoadingCategories(false);
    }
  }

  function updateSelectedImage(asset: ImagePicker.ImagePickerAsset) {
    if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
      Alert.alert(
        "Image trop volumineuse",
        "Veuillez choisir une image de 5 Mo maximum."
      );
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
      Alert.alert(
        "Autorisation requise",
        "Veuillez autoriser l'accès aux photos pour joindre une image."
      );
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
      Alert.alert(
        "Autorisation requise",
        "Veuillez autoriser l'accès à l'appareil photo pour prendre une photo du signalement."
      );
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
          "Autorisation requise",
          "Veuillez autoriser l'accès à votre position pour centrer la carte."
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
        "Impossible d'obtenir la position",
        "Veuillez réessayer ou placer le marqueur manuellement sur la carte."
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

  function resetForm() {
    setTitle("");
    setDescription("");
    setSelectedImage(null);
    setSelectedCategoryId(categories[0]?.id ?? null);
    setShowUserLocation(false);
    setCoordinate(defaultCoordinates);
    setFormResetKey((currentValue) => currentValue + 1);
  }

  async function handleSubmit() {
    if (!title.trim() || !description.trim() || !selectedCategoryId) {
      Alert.alert(
        "Informations manquantes",
        "Veuillez compléter le titre, la description et la catégorie."
      );
      return;
    }

    if (!selectedImage) {
      Alert.alert(
        "Photo manquante",
        "Veuillez joindre une image avant l'envoi."
      );
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
            "Veuillez réessayer."
        );
      }

      resetForm();

      navigation.navigate("ReportDetail", {
        reportId: (parsedBody as Report).id,
      });
    } catch (error: any) {
      Alert.alert(
        "Impossible de créer le signalement",
        error.message ||
          `Veuillez réessayer. Si le problème persiste, vérifiez que l'API est accessible à l'adresse ${apiBaseUrl}.`
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
            <Text style={styles.sectionTitle}>Détails du signalement</Text>
            <Input
              label="Titre"
              onChangeText={setTitle}
              placeholder="Nid-de-poule bloquant la voie de droite"
              value={title}
            />
            <Input
              label="Description"
              multiline
              onChangeText={setDescription}
              placeholder="Décrivez ce qu'il se passe et pourquoi cela demande une intervention."
              value={description}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Catégorie</Text>
            {loadingCategories ? (
              <Text style={styles.sectionText}>Chargement des catégories...</Text>
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
                        {formatCategoryName(category.name)}
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
              Ajoutez une photo depuis votre appareil ou votre galerie. La taille doit être de 5 Mo maximum.
            </Text>
            <Button
              onPress={() => setPickerVisible(true)}
              title={selectedImage ? "Changer la photo" : "Ajouter une photo"}
              variant="secondary"
            />
            {selectedImage ? (
              <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
            ) : null}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Localisation</Text>
            <Text style={styles.sectionText}>
              Touchez la carte ou déplacez le marqueur pour ajuster la position du signalement.
            </Text>
            <Button
              loading={requestingLocation}
              onPress={handleUseCurrentLocation}
              title="Utiliser ma position"
              variant="secondary"
            />
            <MapView
              key={formResetKey}
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
                title="Position sélectionnée"
              />
            </MapView>
          </View>

          <Button loading={submitting} onPress={handleSubmit} title="Créer un signalement" />
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
            <Text style={styles.sheetTitle}>Ajouter une photo</Text>
            <Text style={styles.sheetText}>
              Choisissez entre prendre une nouvelle photo ou utiliser une image de votre galerie.
            </Text>

            <Pressable onPress={handleTakePhoto} style={styles.sheetAction}>
              <View style={styles.sheetIconWrap}>
                <Ionicons color={colors.primaryDark} name="camera-outline" size={20} />
              </View>
              <View style={styles.sheetCopy}>
                <Text style={styles.sheetActionTitle}>Prendre une photo</Text>
                <Text style={styles.sheetActionText}>
                  {"Ouvrir l'appareil photo et capturer l'incident."}
                </Text>
              </View>
            </Pressable>

            <Pressable onPress={handleChooseFromGallery} style={styles.sheetAction}>
              <View style={styles.sheetIconWrap}>
                <Ionicons color={colors.primaryDark} name="images-outline" size={20} />
              </View>
              <View style={styles.sheetCopy}>
                <Text style={styles.sheetActionTitle}>Choisir depuis la galerie</Text>
                <Text style={styles.sheetActionText}>Sélectionner une image existante sur votre appareil.</Text>
              </View>
            </Pressable>

            <Button onPress={() => setPickerVisible(false)} title="Annuler" variant="secondary" />
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
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
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
    backgroundColor: colors.primarySurface,
    padding: 16,
  },
  sheetIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
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
    backgroundColor: colors.primarySurface,
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
