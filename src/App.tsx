import React, { Component, useEffect, useState } from "react";
import DropdownField, { numArray } from "./components/dropDownField";
import "./App.css";
import {
  Box,
  Button,
  CssBaseline,
  FormControlLabel,
  Grid2,
  SelectChangeEvent,
  Switch,
  TextField,
  ThemeProvider,
} from "@mui/material";
import { MainTheme, textFieldSX } from "./themes/MainTheme";
import {
  CheckboxListener,
  SelectListener,
  TextFieldListener,
} from "./listeners/Listeners";
import { runtime, storage, tabs } from "webextension-polyfill";
import { MessageType, VideoDataType } from "./types/types.d";

function compare(obj1: MessageType, obj2: MessageType) {
  if (
    obj1.ResetTime !== obj2.ResetTime ||
    obj1.ExpireTime !== obj2.ExpireTime ||
    obj1.RefreshTime !== obj2.RefreshTime ||
    obj1.DisableSite !== obj2.DisableSite
  ) {
    return false;
  }

  return true;
}

function App() {
  const [extension, setExtension] = useState<MessageType>({
    ExpireTime: 1,
    RefreshTime: 5,
    ResetTime: 15,
    DisableSite: false,
  });
  useEffect(() => {
    storage.local
      .get(["ExpireTime", "RefreshTime", "ResetTime"])
      .then((item) => {
        tabs.query({ active: true }).then((items) => {
          const videoID =
            new URLSearchParams(items[0].url?.split("?")[1] ?? "").get("v") ??
            "";
          storage.local.get([videoID.toString()]).then((videoItem) => {
            var video = videoItem[videoID] as VideoDataType;
            var storageItem = item as MessageType;
            var newValue: MessageType = {
              ExpireTime: storageItem.ExpireTime ?? 1,
              RefreshTime: storageItem.RefreshTime ?? 5,
              ResetTime: storageItem.ResetTime ?? 15,
            };

            if (video) {
              newValue = {
                ...newValue,
                DisableSite: video.DisableSite ?? false,
              };
            }
            if (!compare(newValue, extension)) {
              setExtension(newValue);
            }
          });
        });
      });
  }, [extension]);
  const handleClear = () => {
    runtime.sendMessage({ action: "clearAll" });
  };
  return (
    <ThemeProvider theme={MainTheme}>
      <CssBaseline />
      <Box component="main">
        <Grid2 container direction="column">
          <Grid2 direction="row" style={{ width: "100%" }}>
            <TextField
              id="ExpireTime"
              value={extension.ExpireTime}
              label="Expiration Time"
              variant="outlined"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                TextFieldListener(event);
                setExtension({
                  ...extension,
                  ExpireTime: parseInt(event.target.value),
                });
              }}
              sx={{ ...textFieldSX }}
              fullWidth
            ></TextField>
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
                width="100%"
                height="60px"
                items={numArray(5, 100, 5)}
                sx={textFieldSX}
                initialValue={extension.RefreshTime}
                onChange={(id: string, event: SelectChangeEvent) => {
                  SelectListener(id, event);
                  setExtension({
                    ...extension,
                    RefreshTime: parseInt(event.target.value),
                  });
                }}
              />
            </Grid2>
            <Grid2 style={{ width: "49%" }}>
              <DropdownField
                id="ResetTime"
                label="Reset Time"
                width="100%"
                height="60px"
                items={numArray(15, 100, 5)}
                sx={textFieldSX}
                initialValue={extension.ResetTime}
                onChange={(id: string, event: SelectChangeEvent) => {
                  SelectListener(id, event);
                  setExtension({
                    ...extension,
                    ResetTime: parseInt(event.target.value),
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
            <Button
              variant="contained"
              style={{
                width: "100%",
              }}
              onClick={handleClear}
            >
              Clear All Videos
            </Button>
          </Grid2>
          <Grid2
            style={{
              width: "100%",
              justifyContent: "start",
            }}
          >
            <FormControlLabel
              label="Disable Site"
              labelPlacement="start"
              checked={extension.DisableSite}
              value={extension.DisableSite}
              sx={{
                textAlign: "start",
                width: "100%",
                height: "60px",
                marginLeft: "0",
                marginTop: "auto",
                marginBottom: "auto",
                display: "inline-flex",
              }}
              slotProps={{
                typography: {
                  textAlign: "start",
                  marginTop: "auto",
                  marginBottom: "auto",
                  paddingTop: "15px",
                },
              }}
              control={
                <Switch
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
                    CheckboxListener(event, checked);
                    console.log(checked);
                    setExtension({
                      ...extension,
                      DisableSite: checked,
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
