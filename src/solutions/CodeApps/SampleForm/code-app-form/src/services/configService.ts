export const getHeaderLabel = (): string => {
  return import.meta.env.VITE_KLS_HEADERLABEL ??
    "Employee Registration Form 1";
};
