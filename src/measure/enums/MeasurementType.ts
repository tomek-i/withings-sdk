/**
 * @see https://developer.withings.com/api-reference#tag/measure/operation/measure-getmeas
 */
export enum MeasurementType {
  Weight = 1,
  Height = 4,
  FatFreeMass = 5,
  FatRatio = 6,
  FatMassWeight = 8,
  DiastolicBloodPressure = 9,
  SystolicBloodPressure = 10,
  HeartPulse = 11,
  Temperature = 12,
  SPO02 = 54,
  BodyTemperature = 71,
  SkinTemperature = 73,
  MuscleMass = 76, // in kg
  Hydration = 77,
  BoneMass = 88,
  PulseWaveVelocity = 91,
  VO2Max = 123,
  AtrialFibrilation = 130,
  QRSInterval = 135,
  PRInterval = 136,
  QTInterval = 137,
  QTcInterval = 138, // corrected
  AtrialFibrilationPPG = 139,
  VascularAge = 155,
  NerveHealthScore = 167,
  ExtraCellularWater = 168, //in kg
  IntraCellularWater = 169, //in kg
  VisceralFat = 170, //without unity
  FatMass = 174,
  MuscleMassSegments = 175,
  ElectrodermalActivity = 196,
}
