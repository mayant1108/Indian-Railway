export const generatePnr = () =>
  `${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;
