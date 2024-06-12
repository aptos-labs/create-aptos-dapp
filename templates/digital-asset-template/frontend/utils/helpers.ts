export const dateToSeconds = (date: Date | undefined) => {
  if (!date) return;
  const dateInSeconds = Math.floor(+date / 1000);
  return dateInSeconds;
};
