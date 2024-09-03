/**
 * Converts a string representation of APT to octas (smallest unit in Aptos)
 * @param amount - String representation of APT amount
 * @returns BigInt representing the amount in octas
 */
export function parseAptos(amount: string): number {
  const parts = amount.split(".");
  const wholePart = parts[0];
  let fractionalPart = parts[1] || "";

  // Pad or truncate fractional part to 8 digits
  fractionalPart = fractionalPart.padEnd(8, "0").slice(0, 8);

  // Combine whole and fractional parts
  const octas = wholePart + fractionalPart;

  // Remove leading zeros and convert to BigInt
  return Number(octas.replace(/^0+/, "") || "0");
}

/**
 * Converts octas to a string representation of APT
 * @param octas - BigInt representing the amount in octas
 * @returns String representation of the APT amount
 */
export function formatAptos(octas: number): string {
  const aptString = octas.toString().padStart(9, "0");
  const wholePart = aptString.slice(0, -8) || "0";
  const fractionalPart = aptString.slice(-8);
  return `${wholePart}.${fractionalPart}`;
}
