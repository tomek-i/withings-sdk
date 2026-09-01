/**
 * Measurement types accepted by `meastype`/`meastypes` and returned as the
 * `type` of each {@link Measure}.
 *
 * @see https://developer.withings.com/api-reference/#tag/measure/operation/measure-getmeas
 */
export enum MeasurementType {
  /** Weight, in kg. */
  Weight = 1,
  /** Height, in meters. */
  Height = 4,
  /** Fat free mass, in kg. */
  FatFreeMass = 5,
  /** Fat ratio, as a percentage. */
  FatRatio = 6,
  /** Fat mass weight, in kg. */
  FatMassWeight = 8,
  /** Diastolic blood pressure, in mmHg. */
  DiastolicBloodPressure = 9,
  /** Systolic blood pressure, in mmHg. */
  SystolicBloodPressure = 10,
  /** Heart pulse, in bpm. Only for BPM and scale devices. */
  HeartPulse = 11,
  /** Temperature, in Celsius. */
  Temperature = 12,
  /** SpO2, as a percentage. */
  SPO02 = 54,
  /** Body temperature, in Celsius. */
  BodyTemperature = 71,
  /** Skin temperature, in Celsius. */
  SkinTemperature = 73,
  /** Muscle mass, in kg. */
  MuscleMass = 76,
  /** Hydration, in kg. */
  Hydration = 77,
  /** Bone mass, in kg. */
  BoneMass = 88,
  /** Pulse wave velocity, in m/s. */
  PulseWaveVelocity = 91,
  /** VO2 max: ability to consume oxygen, in ml/min/kg. */
  VO2Max = 123,
  /** Atrial fibrillation result. */
  AtrialFibrilation = 130,
  /** QRS interval duration, from the ECG signal. */
  QRSInterval = 135,
  /** PR interval duration, from the ECG signal. */
  PRInterval = 136,
  /** QT interval duration, from the ECG signal. */
  QTInterval = 137,
  /** Corrected QT interval. */
  QTcInterval = 138,
  /** Atrial fibrillation result, from the PPG signal. */
  AtrialFibrilationPPG = 139,
  /** Vascular age. */
  VascularAge = 155,
  /** Nerve health score: conductance, 2 electrodes, feet. */
  NerveHealthScore = 167,
  /** Extracellular water, in kg. */
  ExtraCellularWater = 168,
  /** Intracellular water, in kg. */
  IntraCellularWater = 169,
  /** Visceral fat, unitless. */
  VisceralFat = 170,
  /** Fat mass for segments, in mass units. */
  FatMass = 174,
  /** Muscle mass for segments. */
  MuscleMassSegments = 175,
  /** Nerve response score (NRS). */
  ElectrodermalActivity = 196,
}
