export const colors = {
  ink: "#111111",
  paper: "#FFFFFF",
  moss: "#2F6B4F",
  mossDark: "#234F3A",
  amber: "#C77D02",
  border: "#E5E5E5",
  gray: "#8A8A8A",
  grayLight: "#F5F5F5",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 62,
};

// Every card/button/input in this app uses radius.none. No exceptions.
export const radius = {
  none: 0,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: "700" as const, color: colors.ink },
  h2: { fontSize: 20, fontWeight: "600" as const, color: colors.ink },
  body: { fontSize: 15, fontWeight: "400" as const, color: colors.ink },
  label: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: colors.gray,
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
  },
};
