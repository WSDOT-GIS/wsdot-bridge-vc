/**
 * Splits inches into feet and height components.
 * @param heightInInches integer value representing inches.
 * @returns An array of two integers: feet and inches.
 */
export function toFeetAndInches(heightInInches: number): [number, number] {
  const inches = heightInInches % 12;
  const feet = (heightInInches - inches) / 12;
  return [feet, inches];
}
