export const APT_DECIMALS = 8;

export const convertAmountFromHumanReadableToOnChain = (value: number, decimal: number) => {
  return value * Math.pow(10, decimal);
};

export const convertAmountFromOnChainToHumanReadable = (value: number, decimal: number) => {
  return value / Math.pow(10, decimal);
};

export const secondsToDate = (seconds: number): Date => {
  const milliseconds = seconds * 1000;
  const date = new Date(milliseconds);
  return date;
};
