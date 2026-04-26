import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
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
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAssetUrl } from "../api/client";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";
import { AppStackParamList } from "../navigation/AppNavigator";
import { UploadableImage } from "../utils/types";
import { colors, shadows } from "../utils/theme";

type Props = NativeStackScreenProps<AppStackParamList, "EditProfile">;

function EditProfileScreen({ navigation }: Props) {
  const { user, updateUser } = useAuth();

  const [formValues, setFormValues] = useState({
    first_name: "",
    last_name: "",
    bio: "",
  });
  const [selectedImage, setSelectedImage] = useState<UploadableImage | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormValues({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      bio: user?.bio || "",
    });
  }, [user?.bio, user?.first_name, user?.last_name]);

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
      Alert.alert("Permission needed", "Please allow photo access to update your profile image.");
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
      Alert.alert("Permission needed", "Please allow camera access to take a profile photo.");
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

  async function handleSaveProfile() {
    if (!formValues.first_name.trim() || !formValues.last_name.trim()) {
      Alert.alert("Missing details", "First name and last name are required.");
      return;
    }

    setSaving(true);

    try {
      await updateUser({
        first_name: formValues.first_name.trim(),
        last_name: formValues.last_name.trim(),
        bio: formValues.bio.trim(),
      }, selectedImage);

      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        "Unable to save profile",
        error.response?.data?.message || error.message || "Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  const profilePreviewUri = selectedImage?.uri || getAssetUrl(user?.profile_image_url);

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile photo</Text>
            <Text style={styles.sectionText}>
              Add a clear profile image using your camera or gallery.
            </Text>
            {profilePreviewUri ? (
              <Image source={{ uri: profilePreviewUri }} style={styles.profilePreview} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Ionicons color={colors.primaryDark} name="person-outline" size={34} />
                <Text style={styles.profilePlaceholderText}>No profile image yet</Text>
              </View>
            )}
            <Button
              onPress={() => setPickerVisible(true)}
              title={profilePreviewUri ? "Change Photo" : "Add Photo"}
              variant="secondary"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Update your profile</Text>
            <Text style={styles.sectionText}>
              Keep your name and bio up to date so municipality staff can identify your reports.
            </Text>
            <Input
              label="First Name"
              onChangeText={(value) =>
                setFormValues((currentValues) => ({ ...currentValues, first_name: value }))
              }
              value={formValues.first_name}
            />
            <Input
              label="Last Name"
              onChangeText={(value) =>
                setFormValues((currentValues) => ({ ...currentValues, last_name: value }))
              }
              value={formValues.last_name}
            />
            <Input
              label="Bio"
              multiline
              onChangeText={(value) =>
                setFormValues((currentValues) => ({ ...currentValues, bio: value }))
              }
              placeholder="Tell your city something about you."
              value={formValues.bio}
            />
          </View>

          <View style={styles.footerActions}>
            <Button loading={saving} onPress={handleSaveProfile} title="Save Changes" />
            <Button onPress={() => navigation.goBack()} title="Cancel" variant="secondary" />
          </View>
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
            <Text style={styles.sheetTitle}>Update profile photo</Text>
            <Text style={styles.sheetText}>
              Choose whether you want to take a new photo or use one from your gallery.
            </Text>

            <Pressable onPress={handleTakePhoto} style={styles.sheetAction}>
              <View style={styles.sheetIconWrap}>
                <Ionicons color={colors.primaryDark} name="camera-outline" size={20} />
              </View>
              <View style={styles.sheetCopy}>
                <Text style={styles.sheetActionTitle}>Take Photo</Text>
                <Text style={styles.sheetActionText}>Capture a new profile image now.</Text>
              </View>
            </Pressable>

            <Pressable onPress={handleChooseFromGallery} style={styles.sheetAction}>
              <View style={styles.sheetIconWrap}>
                <Ionicons color={colors.primaryDark} name="images-outline" size={20} />
              </View>
              <View style={styles.sheetCopy}>
                <Text style={styles.sheetActionTitle}>Choose from Gallery</Text>
                <Text style={styles.sheetActionText}>Use an existing image from your device.</Text>
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
  profilePreview: {
    width: "100%",
    height: 220,
    borderRadius: 24,
    backgroundColor: "#e5e7eb",
  },
  profilePlaceholder: {
    height: 220,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fffaf3",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  profilePlaceholderText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
  },
  footerActions: {
    gap: 10,
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
});

export default EditProfileScreen;
