import { createTheme, FormControlLabel, styled, Switch } from "@mui/material";

declare module "@mui/material/styles" {
  interface Theme {
    palette: {
      mode: string;
    };
    typography: {
      body1: {
        width: number;
        height: number;
        fontFamily: string;
        fontSize: number;
        marginLeft: string;
        marginRight: string;

        margin: number;
      };
    };
  }
  interface ThemeOptions {
    status?: {
      danger?: string;
    };
  }
}

export const MainTheme = createTheme({
  palette: { mode: "dark" },
  typography: {
    body1: {
      width: 300,
      height: 300,
      fontFamily: "monospace",
      fontSize: 16,
      marginLeft: "20px",
      marginRight: "20px",

      margin: 0,
    },
  },

  components: {
    MuiGrid2: {
      defaultProps: {
        textAlign: "center",
        spacing: "5px",
      },
      styleOverrides: {
        container: {
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "5px",
        },
      },
    },
  },
});

export const textFieldSX = {
  height: "60px",

  "& .MuiInputBase-input": {
    textAlign: "center",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    paddingLeft: "5px", // Move the notch (background) by 14px
    textAlign: "center",
    justifyContent: "center",
  },
  "& .MuiInputLabel-root": {
    transformOrigin: "left", // Ensure label animation starts from the left
    textAlign: "center",
    justifyContent: "center",
    height: "unset",
  },
  "& MuiFormLabel-root": {
    height: "unset",
  },
  "& .MuiInputLabel-shrink": {
    textAlign: "left",
  },
};

export const FormControlLabelStyle = styled(FormControlLabel)(
  ({ theme: Theme }) => ({
    textAlign: "start",
    width: "100%",
    height: "60px",
    marginLeft: "0",
    marginTop: "auto",
    marginBottom: "auto",
    display: "inline-flex",
    "& .MuiFormControlLabel-root": {
      width: "100%",
      height: "60px",
      marginLeft: "0",
      marginTop: "auto",
      marginBottom: "auto",
    },
    "& .MuiFormControlLabel-label": {
      height: "60px",
    },
  }),
);

export const SwitchStyle = styled(Switch)(({ theme }) => ({
  width: "60px",
  height: "40px",

  "& .MuiSwitch-thumb": {
    width: 22,
    height: 22,
  },
}));
