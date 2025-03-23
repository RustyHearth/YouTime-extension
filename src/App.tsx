import React, { useEffect, useState } from "react";
import DropdownField, { numArray } from "./components/dropDownField";
import "./App.css";
import {
  Box,
  Button,
  CssBaseline,
  debounce,
  Grid2,
  IconButton,
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
import { SearchOutlined } from "@mui/icons-material";
import SearchComplete from "./components/Search_Complete";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { NavLink } from "react-router";
import { compareObjects } from "./helpers/data_helpers";

const expiredTimeText = debounce(
  (value: string, callback?: (value: string) => void) => {
    if (callback) {
      callback(value);
    }
  },
  300,
);

const numberReg = new RegExp("^[0-9]+$");

function App() {
  const [extension, setExtension] = useState<ExtensionValues>({
    ExpireTime: 1,
    RefreshTime: 5,
    ResetTime: 15,
    DisableSite: false,
    StopExtension: false,
  });
  const [openSearch, setOpenSearch] = useState<boolean>(false);
  const [expireText, setExpireText] = useState<string>("");
  const [openInfo, setOpenInfo] = useState<boolean>(true);
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
      if (!compareObjects(newValue, extension, [])) {
        setExtension(newValue);
      }
      setExpireText(newValue.ExpireTime.toString());
    }, true);
  }, [extension]);
  const handleClear = () => {
    runtime.sendMessage({
      action: MessageAction.ClearAll,
      value: {},
    } as MessageTransfer);
  };
  var handleOpenSearch = () => {
    setTimeout(() => {
      setOpenInfo(!openInfo);
    }, 200);
    setOpenSearch(!openSearch);
  };
  var searchClasses = "search-close " + (openSearch ? "search-open" : "");
  var infoClasses = openInfo ? "info-open" : "info-close";
  return (
    <ThemeProvider theme={MainTheme}>
      <CssBaseline />
      <Box component="main">
        <Grid2 container direction="column">
          <Grid2
            container
            direction="row"
            sx={{
              justifyContent: "end",
              alignItems: "end",
              width: "100%",
            }}
          >
            <Grid2 className={searchClasses} sx={{ height: "60px" }}>
              <SearchComplete
                sx={{
                  ...textFieldSX,
                  paddingBottom: "5px",
                  width: "100%",
                  height: "60px",
                }}
                label="Search Videos"
                fullWidth
              />
            </Grid2>
            <Grid2 className={infoClasses}>
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
              >
                <NavLink
                  style={{
                    display: "flex",
                    color: "inherit",
                    padding: 0,
                    margin: "auto",
                    textDecoration: "none",
                  }}
                  to="/Info"
                >
                  <InfoOutlinedIcon />
                </NavLink>
              </IconButton>
            </Grid2>
            <Grid2
              style={{
                position: "relative",
                height: "60px",
                marginTop: "auto",
                marginBottom: "auto",
                display: "flex",
              }}
            >
              <IconButton
                aria-label="Search"
                style={{
                  position: "relative",
                  marginTop: "auto",
                  marginBottom: "auto",
                  display: "flex",
                  width: "40px",
                  height: "40px",
                }}
                onClick={handleOpenSearch}
              >
                <TooltipStyle title="Search saved videos.">
                  {openSearch ? <ClearOutlinedIcon /> : <SearchOutlined />}
                </TooltipStyle>
              </IconButton>
            </Grid2>
          </Grid2>
          <Grid2 direction="row" style={{ width: "100%" }}>
            <TooltipStyle title="Days before video timestamp expires.">
              <TextField
                id="ExpireTime"
                value={expireText}
                label="Expiration Time"
                variant="outlined"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  var value = event.currentTarget.value;
                  if (!numberReg.test(value)) {
                    return;
                  }
                  setExpireText(value);
                  expiredTimeText(event.currentTarget.value, (value) => {
                    TextFieldListener(event, () => {
                      setExtension({
                        ...extension,
                        ExpireTime: parseInt(value),
                      });
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
