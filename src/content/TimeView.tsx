import React, { useEffect, useMemo, useRef, useState } from "react";
import { runtime, storage } from "webextension-polyfill";
import { DataPackage, MessageAction, VideoDataType } from "../types/types.d";
import "./TimeView.css";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Button,
  CssBaseline,
  IconButton,
  Menu,
  MenuItem,
  ThemeProvider,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  dataAction,
  grabVideoID,
  initialVideoData,
  theme,
} from "./TimeView_helpers";

function TimeView(): React.JSX.Element {
  var videoID = grabVideoID();
  var [pause, setPause] = useState<boolean>(false);
  var [menuAnchor, setMenuAnchor] = useState<HTMLButtonElement | null>(null);
  var [videoData, setVideoData] = useState<VideoDataType>(initialVideoData());
  var viewRef = useRef<HTMLDivElement>(null);
  var open = Boolean(menuAnchor);
  var dataPackage = useRef<DataPackage>({
    videoID: videoID,
    videoData: videoData,
    refreshTime: 5,
    resetTime: 15,
    contentInterval: null,
    setVideoData: setVideoData,
    pause: pause,
  });
  dataPackage.current.videoID = videoID;
  dataPackage.current.videoData = videoData;
  dataPackage.current.pause = pause;
  useEffect(() => {
    if (!runtime.onMessage.hasListener(onMessage)) {
      dataPackage.current.pause = false;
      dataAction({ action: "init", value: {} }, dataPackage);
      runtime.onMessage.addListener(onMessage);
    }
  }, []);
  function onMessage(msg: unknown) {
    var request = msg as MessageAction;
    var videoChange = grabVideoID() !== dataPackage.current.videoID;

    if (request.action === "pageRefresh" && !videoChange) {
      return;
    }
    if (request.action === "pageRefresh" && videoChange) {
      dataPackage.current.videoID = grabVideoID();
      dataPackage.current.videoData = initialVideoData();
      dataPackage.current.pause = false;
    }
    dataAction(request, dataPackage);
  }

  var timeText = useMemo(() => {
    return (
      <Typography
        style={{
          fontFamily: "monospace",
          letterSpacing: -1,
          fontSize: 18,
        }}
      >
        {(videoData?.hours ?? "0") +
          ":" +
          (videoData?.minutes ?? "0") +
          ":" +
          (videoData?.seconds ?? "0")}
      </Typography>
    );
  }, [videoData]);

  const handleClose = () => {
    setMenuAnchor(null);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };
  const handleClearData = () => {
    storage.local.remove(videoID).then(() => {
      dataPackage.current.videoData = initialVideoData();
      dataAction({ action: "init", value: {} }, dataPackage);
    });
    handleClose();
  };
  const handlePause = () => {
    setPause(!dataPackage.current.pause);
    dataPackage.current.pause = !dataPackage.current.pause;
    dataAction({ action: "init", value: {} }, dataPackage);
    handleClose();
  };
  const timeJump = (videoData: VideoDataType) => {
    runtime.sendMessage({
      action: "timeJump",
      value: videoData,
    });
  };
  const handleDisable = () => {
    dataAction(
      { action: "dataChange", value: { DisableSite: true } },
      dataPackage,
    );
    handleClose();
  };
  const cancelButton = (ref: HTMLDivElement) => {
    ref.remove();
  };
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!videoData.DisableSite && (
        <div id="time-view-container" ref={viewRef} className="time-container">
          <div
            className={
              "menu-button-container " + (open ? "menu-open-container" : "")
            }
          >
            <IconButton aria-label="Menu" onClick={handleClick}>
              <MenuIcon />
            </IconButton>
            <Menu
              id="basic-menu"
              anchorEl={menuAnchor}
              open={open}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClearData}>
                <Tooltip
                  title="Clears Data and Starts Reset Time again."
                  placement="right"
                >
                  <p style={{ width: "100%", height: "100%" }}>
                    Clear Video Data
                  </p>
                </Tooltip>
              </MenuItem>
              <MenuItem onClick={handlePause}>
                <Tooltip
                  title="Pause until refresh or toggle."
                  placement="right"
                >
                  <p style={{ width: "100%", height: "100%" }}>
                    {!dataPackage.current.pause && "Pause"}
                    {dataPackage.current.pause && "Resume"}
                  </p>
                </Tooltip>
              </MenuItem>
              <MenuItem onClick={handleDisable}>Disable Site</MenuItem>
            </Menu>
          </div>
          <div
            id="time-button"
            className={
              "time-button-container " + (open ? "time-open-container" : "")
            }
          >
            <Button
              variant="contained"
              className={"time-button " + (open ? "time-open" : "")}
              style={{ width: "100%" }}
              onClick={() => {
                timeJump(videoData);
              }}
            >
              {timeText}
            </Button>
          </div>

          <div
            className={
              "cancel-button-container " + (open ? "cancel-open-container" : "")
            }
          >
            <IconButton
              aria-label="Cancel"
              onClick={() => {
                cancelButton(viewRef.current);
              }}
            >
              <ClearOutlinedIcon />
            </IconButton>
          </div>
        </div>
      )}
    </ThemeProvider>
  );
}

export default TimeView;
