import { Alert } from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import ImageResizer from "react-native-image-resizer";

type UploadFn = (image: {
  uri: string;
  name: string;
  type: string;
}) => Promise<void>;

export const uploadProfileImageFlow = (
  uploadFn: UploadFn,
  userId: number | string
) => {
  Alert.alert("프로필 사진", "선택하세요", [
    { text: "사진 찍기", onPress: () => openCamera(uploadFn, userId) },
    { text: "파일에서 선택", onPress: () => openGallery(uploadFn, userId) },
    { text: "취소", style: "cancel" }
  ]);
};

const pickerOptions = {
  mediaType: "photo",
  quality: 1
};

const openCamera = async (uploadFn: UploadFn, userId: number | string) => {
  const res = await launchCamera(pickerOptions);
  handleResult(res, uploadFn, userId);
};

const openGallery = async (uploadFn: UploadFn, userId: number | string) => {
  const res = await launchImageLibrary(pickerOptions);
  handleResult(res, uploadFn, userId);
};

const handleResult = async (
  res: any,
  uploadFn: UploadFn,
  userId: number | string
) => {
  if (res.didCancel || res.errorCode) return;

  const asset = res.assets?.[0];
  if (!asset?.uri) return;

  const processed = await processImage(asset);

  await uploadFn({
    uri: processed.uri,
    name: `${userId}_profile.jpg`,
    type: "image/jpeg"
  });
};

const processImage = async (asset: any) => {
  return ImageResizer.createResizedImage(
    asset.uri,
    200,
    200,
    "JPEG",
    80,
    0,
    undefined,
    false,
    {
      mode: "cover",
      onlyScaleDown: true
    }
  );
};
