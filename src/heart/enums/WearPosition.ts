/**
 * Where on the body the device was held or worn during a recording.
 *
 * @see https://developer.withings.com/api-reference/#tag/heart/operation/heartv2-get
 */
export enum WearPosition {
  /** Right wrist. */
  RightWrist = 0,
  /** Left wrist. */
  LeftWrist = 1,
  /** Right arm. */
  RightArm = 2,
  /** Left arm. */
  LeftArm = 3,
  /** Right foot. */
  RightFoot = 4,
  /** Left foot. */
  LeftFoot = 5,
  /** Between legs. */
  BetweenLegs = 6,
  /** Left part of the body. */
  LeftBody = 8,
  /** Right part of the body. */
  RightBody = 9,
  /** Left leg. */
  LeftLeg = 10,
  /** Right leg. */
  RightLeg = 11,
  /** Torso. */
  Torso = 12,
  /** Left hand. */
  LeftHand = 13,
  /** Right hand. */
  RightHand = 14,
  /** Cardiovascular aortic area. */
  CardiovascularAortic = 15,
  /** Cardiovascular pulmonic area. */
  CardiovascularPulmonic = 16,
  /** Cardiovascular tricuspid area. */
  CardiovascularTricuspid = 17,
  /** Cardiovascular mitral area. */
  CardiovascularMitral = 18,
  /** Cardiovascular apex area. */
  CardiovascularApex = 19,
  /** Pulmonary front upper right area. */
  PulmonaryFrontUpperRight = 20,
  /** Pulmonary front upper left area. */
  PulmonaryFrontUpperLeft = 21,
  /** Pulmonary front bottom right area. */
  PulmonaryFrontBottomRight = 22,
  /** Pulmonary front bottom left area. */
  PulmonaryFrontBottomLeft = 23,
  /** Pulmonary back upper left area. */
  PulmonaryBackUpperLeft = 24,
  /** Pulmonary back upper right area. */
  PulmonaryBackUpperRight = 25,
  /** Pulmonary back bottom left area. */
  PulmonaryBackBottomLeft = 26,
  /** Pulmonary back bottom right area. */
  PulmonaryBackBottomRight = 27,
  /** Wide mode area. */
  WideMode = 28,
  /** Between arms. */
  BetweenArms = 29,
  /** Hold right. */
  HoldRight = 30,
  /** Hold left. */
  HoldLeft = 31,
}
