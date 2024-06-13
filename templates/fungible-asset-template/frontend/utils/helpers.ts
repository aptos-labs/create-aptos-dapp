export const APT_DECIMALS = 8;

export const convertAmountFromHumanReadableToOnChain = (
  value: number,
  decimal: number
) => {
  return value * Math.pow(10, decimal);
};
