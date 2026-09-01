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
  /**
   * Skin temperature, in Celsius.
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  SkinTemperature = 73,
  /** Muscle mass, in kg. */
  MuscleMass = 76,
  /** Hydration, in kg. */
  Hydration = 77,
  /** Bone mass, in kg. */
  BoneMass = 88,
  /**
   * Pulse wave velocity, in m/s.
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  PulseWaveVelocity = 91,
  /**
   * VO2 max: ability to consume oxygen, in ml/min/kg.
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  VO2Max = 123,
  /**
   * Atrial fibrillation result.
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  AtrialFibrilation = 130,
  /**
   * QRS interval duration, from the ECG signal.
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  QRSInterval = 135,
  /**
   * PR interval duration, from the ECG signal.
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  PRInterval = 136,
  /**
   * QT interval duration, from the ECG signal.
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  QTInterval = 137,
  /**
   * Corrected QT interval.
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  QTcInterval = 138,
  /**
   * Atrial fibrillation result, from the PPG signal.
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  AtrialFibrilationPPG = 139,
  /**
   * Vascular age.
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  VascularAge = 155,
  /**
   * Nerve health score: conductance, 2 electrodes, feet.
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  NerveHealthScore = 167,
  /**
   * Extracellular water, in kg.
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  ExtraCellularWater = 168,
  /**
   * Intracellular water, in kg.
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  IntraCellularWater = 169,
  /**
   * Visceral fat, unitless.
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  VisceralFat = 170,
  /**
   * Fat free mass for segments.
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  FatFreeMassSegments = 173,
  /**
   * Fat mass for segments, in mass units.
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  FatMass = 174,
  /**
   * Muscle mass for segments.
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  MuscleMassSegments = 175,
  /** Nerve response score (NRS). */
  ElectrodermalActivity = 196,
  /**
   * Basal metabolic rate (BMR).
   *
   * Requires the Total Biomarker Pack, so a paid Withings API plan.
   */
  BasalMetabolicRate = 226,
  /** Metabolic age. */
  MetabolicAge = 227,
  /** Electrochemical skin conductance (ESC). */
  ElectrochemicalSkinConductance = 229,
}
