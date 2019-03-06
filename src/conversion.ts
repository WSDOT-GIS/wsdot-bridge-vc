export function toFeetAndInches(heightInInches: number) {
  const inches = heightInInches % 12;
  const feet = (heightInInches - inches) / 12;
  return [feet, inches];
}
