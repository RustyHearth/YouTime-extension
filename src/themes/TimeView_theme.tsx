import { createTheme } from "@mui/material";

export const timeViewTheme = createTheme({
  palette: { mode: "dark" },

  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          minWidth: "0px",
          width: "100%",
          height: "100%",
          padding: 0,
          boxShadow: "none",
          textAlign: "start",
        },
        root: {
          minWidth: "0px",
          width: "100%",
          height: "100%",
          padding: 0,
          boxShadow: "none",
          textAlign: "start",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: "0px",
          width: "100%",
          height: "100%",
          padding: 0,
          margin: 0,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: "#90caf9",
          color: "#000",
          fontSize: "16px",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {},
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: "12px",
        },
      },
    },
  },
});
