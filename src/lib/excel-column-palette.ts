/** Paleta exportu · vlastní pevné ARGB světlého režimu · nesmí měnit tokeny. */
import type { ColumnTone } from "./column-tones";
/** Pevné ARGB světlé palety; synchronizaci s CSS ověřuje test col-tones. */
export const COLUMN_TONE_ARGB: Record<ColumnTone, { fill: string; font: string }> = {
  "gray-soft": {
    fill: "FFF0F4F9",
    font: "FF303337",
  },
  "gray-strong": {
    fill: "FF4F5357",
    font: "FFFBFCFD",
  },
  "blue-soft": {
    fill: "FFE9F5FF",
    font: "FF163553",
  },
  "blue-strong": {
    fill: "FF085491",
    font: "FFFBFCFD",
  },
  "teal-soft": {
    fill: "FFE3F8F9",
    font: "FF003C40",
  },
  "teal-strong": {
    fill: "FF006065",
    font: "FFFAFCFC",
  },
  "olive-soft": {
    fill: "FFF3F6E5",
    font: "FF323608",
  },
  "olive-strong": {
    fill: "FF515723",
    font: "FFFCFCFA",
  },
  "yellow-soft": {
    fill: "FFF8F4E3",
    font: "FF3D3201",
  },
  "yellow-strong": {
    fill: "FF625101",
    font: "FFFCFCFA",
  },
  "orange-soft": {
    fill: "FFFFF0E6",
    font: "FF4C290E",
  },
  "orange-strong": {
    fill: "FF833C00",
    font: "FFFDFBFA",
  },
  "pink-soft": {
    fill: "FFFFEEF5",
    font: "FF4B2437",
  },
  "pink-strong": {
    fill: "FF81315C",
    font: "FFFDFBFC",
  },
  "purple-soft": {
    fill: "FFF7F0FF",
    font: "FF3B2A4D",
  },
  "purple-strong": {
    fill: "FF623E87",
    font: "FFFCFBFD",
  },
};
