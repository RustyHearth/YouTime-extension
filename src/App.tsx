import React, { useEffect, useState } from "react";
import DropdownField, { numArray } from "./components/dropDownField";
import "./App.css";
import {
  Box,
  Button,
  CssBaseline,
  Grid2,
  SelectChangeEvent,
  TextField,
  ThemeProvider,
} from "@mui/material";
import {
  FormControlLabelStyle,
  MainTheme,
  SwitchStyle,
  textFieldSX,
  TooltipStyle,
} from "./themes/MainTheme";
import {
  CheckboxListener,
  SelectListener,
  TextFieldListener,
} from "./listeners/Listeners";
import { runtime } from "webextension-polyfill";
import {
  MessageAction,
  MessageTransfer,
  ExtensionValues,
} from "./types/types.d";
import { getStorageData } from "./helpers/extension_helper";
import { compareStorage } from "./helpers/data_helpers";

function App() {
  const [extension, setExtension] = useState<ExtensionValues>({
    ExpireTime: 1,
    RefreshTime: 5,
    ResetTime: 15,
    DisableSite: false,
    StopExtension: false,
  });
  useEffect(() => {
    getStorageData((storageData, videoID) => {
      var videoData = storageData[videoID];
      var newValue: ExtensionValues = {
        ExpireTime: storageData.ExpireTime ?? 1,
        RefreshTime: storageData.RefreshTime ?? 5,
        ResetTime: storageData.ResetTime ?? 15,
        DisableSite:
          ((videoData && videoData.DisableSite) ||
            (storageData.StopExtension ?? false)) ??
          false,
        StopExtension: storageData.StopExtension ?? false,
      };
      if (!compareStorage(newValue, extension)) {
        setExtension(newValue);
      }
    }, true);
  }, [extension]);
  const handleClear = () => {
    runtime.sendMessage({
      action: MessageAction.ClearAll,
      value: {},
    } as MessageTransfer);
  };
  return (
    <ThemeProvider theme={MainTheme}>
      <CssBaseline />
      <Box component="main">
        <Grid2 container direction="column">
          <Grid2 direction="row" style={{ width: "100%" }}>
            <TooltipStyle title="Days before video timestamp expires.">
              <TextField
                id="ExpireTime"
                value={extension.ExpireTime}
                label="Expiration Time"
                variant="outlined"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  TextFieldListener(event, () => {
                    setExtension({
                      ...extension,
                      ExpireTime: parseInt(event.target.value),
                    });
                  });
                }}
                sx={{ ...textFieldSX }}
                fullWidth
              ></TextField>
            </TooltipStyle>
          </Grid2>
          <Grid2
            container
            direction="row"
            size="grow"
            style={{
              justifyContent: "space-between",
              alignItems: "start",
            }}
          >
            <Grid2
              style={{
                width: "49%",
                justifyContent: "start",
                alignItems: "start",
              }}
            >
              <DropdownField
                id="RefreshTime"
                label="RefreshTime"
                tooltip="Interval between timestamp updates."
                width="100%"
                height="60px"
                items={numArray(5, 100, 5)}
                sx={textFieldSX}
                initialValue={extension.RefreshTime}
                onChange={(id: string, event: SelectChangeEvent) => {
                  SelectListener(id, event, () => {
                    setExtension({
                      ...extension,
                      RefreshTime: parseInt(event.target.value),
                    });
                  });
                }}
              />
            </Grid2>
            <Grid2 style={{ width: "49%" }}>
              <DropdownField
                id="ResetTime"
                label="Reset Time"
                tooltip="Seconds before starting to update after page load."
                width="100%"
                height="60px"
                items={numArray(15, 100, 5)}
                sx={textFieldSX}
                initialValue={extension.ResetTime}
                onChange={(id: string, event: SelectChangeEvent) => {
                  SelectListener(id, event, () => {
                    setExtension({
                      ...extension,
                      ResetTime: parseInt(event.target.value),
                    });
                  });
                }}
              />
            </Grid2>
          </Grid2>
          <Grid2
            direction="row"
            style={{
              width: "100%",
            }}
          >
            <TooltipStyle title="Removes disables status also.">
              <Button
                variant="contained"
                style={{
                  width: "100%",
                }}
                onClick={handleClear}
              >
                Clear All Videos
              </Button>
            </TooltipStyle>
          </Grid2>
          <Grid2
            style={{
              width: "100%",
              justifyContent: "start",
            }}
          >
            <FormControlLabelStyle
              label="Disable Site"
              labelPlacement="start"
              slotProps={{
                typography: {
                  textAlign: "start",
                  marginTop: "auto",
                  marginBottom: "auto",
                  paddingTop: "15px",
                },
              }}
              control={
                <SwitchStyle
                  id="DisableSite"
                  aria-label="Disable Site"
                  edge="end"
                  style={{ justifyContent: "end" }}
                  checked={extension.DisableSite}
                  value={extension.DisableSite}
                  onChange={(
                    event: React.ChangeEvent<HTMLInputElement>,
                    checked: boolean,
                  ) => {
                    CheckboxListener(event, checked, () => {
                      setExtension({
                        ...extension,
                        DisableSite: checked,
                      });
                    });
                  }}
                />
              }
            />
            <FormControlLabelStyle
              label="Stop Extension"
              labelPlacement="start"
              slotProps={{
                typography: {
                  textAlign: "start",
                  marginTop: "auto",
                  marginBottom: "auto",
                  paddingTop: "15px",
                },
              }}
              control={
                <SwitchStyle
                  id="StopExtension"
                  aria-label="Stop Extension"
                  edge="end"
                  style={{ justifyContent: "end" }}
                  checked={extension.StopExtension}
                  value={extension.StopExtension}
                  onChange={(
                    event: React.ChangeEvent<HTMLInputElement>,
                    checked: boolean,
                  ) => {
                    CheckboxListener(event, checked, () => {
                      setExtension({
                        ...extension,
                        StopExtension: checked,
                      });
                    });
                  }}
                />
              }
            />
          </Grid2>
        </Grid2>
      </Box>
    </ThemeProvider>
  );
}

export default App;
