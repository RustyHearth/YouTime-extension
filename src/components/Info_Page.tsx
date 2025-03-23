import {
  CssBaseline,
  Grid2,
  IconButton,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { MainTheme } from "../themes/MainTheme";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { useNavigate } from "react-router";

export default function InfoPage() {
  const navigation = useNavigate();
  return (
    <ThemeProvider theme={MainTheme}>
      <CssBaseline />
      <Grid2
        container
        direction="column"
        spacing={1}
        style={{ height: "max-content", width: "100%" }}
      >
        <Grid2
          container
          spacing={1}
          direction="row"
          sx={{
            justifyContent: "end",
            alignItems: "end",
            width: "100%",
            height: "min-content",
            padding: 0,
            margin: 0,
          }}
        >
          <Grid2>
            <IconButton
              aria-label="Info"
              style={{
                position: "relative",
                marginTop: "auto",
                marginBottom: "auto",
                display: "flex",
                width: "40px",
                height: "40px",
              }}
              onClick={() => {
                navigation(-1);
              }}
            >
              <ArrowBackOutlinedIcon />
            </IconButton>
          </Grid2>
        </Grid2>
        <Grid2
          container
          direction="column"
          spacing={1}
          style={{
            justifyContent: "start",
            alignItems: "start",
            padding: 0,
            margin: 0,
            width: "100%",
          }}
        >
          <Grid2 spacing={1}>
            <Typography
              style={{
                paddingTop: 0,
                height: "min-content",
                fontSize: 14,
                textAlign: "start",
              }}
            >
              <h1 style={{ paddingTop: 0, marginTop: 0 }}>Description</h1>
              <p>
                Remembers a video's watch time. Useful when you disable youtube
                history or the video doesnt update immediately. also allows to
                search the watched videos in your browser.
              </p>
              <p>
                <b>Expiration time: </b>Time value in days that will hold video
                data before time will reset.
                <br />
                <br />
                <b>Refresh time: </b>Time value in seconds that grabs video
                current time and saves it. Ad time not included
                <br />
                <br />
                <b>Reset time: </b>Time value in seconds that holds of time
                refresh until reset time passed. Ad time not included
                <br />
              </p>
            </Typography>
          </Grid2>
        </Grid2>
      </Grid2>
    </ThemeProvider>
  );
}
