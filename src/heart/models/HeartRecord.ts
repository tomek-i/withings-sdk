import { AfibClassification } from "../enums/AfibClassification";
import { HeartDeviceModel } from "../enums/HeartDeviceModel";

/** The ECG part of a heart recording. */
export interface EcgRecord {
  /** Identifier of the signal, for {@link Heart.get}. */
  signalid?: number;
  /** Atrial fibrillation classification. */
  afib?: AfibClassification;
}

/** The blood pressure part of a heart recording. */
export interface BloodPressureRecord {
  /** Diastolic pressure, in mmHg. */
  diastole?: number;
  /** Systolic pressure, in mmHg. */
  systole?: number;
}

/** The stethoscope part of a heart recording. */
export interface StethoRecord {
  /** Identifier of the signal, for {@link Heart.get}. */
  signalid?: number;
  /** Valvular heart disease classification. */
  vhd?: number;
}

/**
 * One heart recording.
 *
 * Which parts are present depends on the device: a BPM Core records blood
 * pressure, ECG and stethoscope together, while a Move ECG records only the
 * ECG.
 *
 * @see https://developer.withings.com/api-reference/#tag/heart/operation/heartv2-list
 */
export interface HeartRecord {
  /** Identifier of the device that made the recording. */
  deviceid?: string | null;
  /** The device model. */
  model?: HeartDeviceModel;
  /** ECG data, when the device recorded one. */
  ecg?: EcgRecord;
  /** Blood pressure, when the device recorded one. */
  bloodpressure?: BloodPressureRecord;
  /** Stethoscope data, when the device recorded one. */
  stetho?: StethoRecord;
  /** Average heart rate during the recording, in bpm. */
  heart_rate?: number;
  /** Last modification, as a unix timestamp in seconds. */
  modified?: number;
  /** When the recording was taken, as a unix timestamp in seconds. */
  timestamp?: number;
}
