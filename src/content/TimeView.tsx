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
import { dataAction } from "../helpers/TimeView_helpers";
import { grabVideoID, initialVideoData } from "../helpers/data_helpers";
import { timeViewTheme } from "../themes/TimeView_theme";
import {
  mouseDown,
  mouseMove,
  mouseUp,
  Movement,
} from "../listeners/TimeView_listeners";

function TimeView(): React.JSX.Element {
  var videoID = grabVideoID();
  var movement = useRef<Movement>({
    downClickTime: Date.now(),
    mouseDown: false,
    moving: false,
    viewOffsetX: 0,
    viewOffsetY: 0,
    clickOffsetX: 0,
    clickOffsetY: 0,
    posX: 0,
    posY: 0,
  });
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
    stopExtension: false,
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
    return () => {
      runtime.onMessage.removeListener(onMessage);
    };
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
    if (!movement.current.moving) {
      setMenuAnchor(event.currentTarget);
    }
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
    handleClose();
  };
  const timeJump = (videoData: VideoDataType) => {
    if (!movement.current.moving) {
      runtime.sendMessage({
        action: "timeJump",
        value: videoData,
      });
    }
  };
  const handleDisable = () => {
    dataAction(
      { action: "dataChange", value: { DisableSite: true } },
      dataPackage,
    );
    handleClose();
  };
  const cancelButton = (ref: HTMLDivElement) => {
    if (!movement.current.moving) {
      ref.remove();
    }
  };
  const timeMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    mouseDown(event, movement);
  };
  const timeMouseUp = async (event: MouseEvent) => {
    mouseUp(event, movement);
  };
  const timeMouseMove = (event: MouseEvent) => {
    mouseMove(event, movement);
  };
  useEffect(() => {
    document.addEventListener("mouseup", timeMouseUp);
    document.addEventListener("mousemove", timeMouseMove);
    return () => {
      document.removeEventListener("mouseup", timeMouseUp);
      document.removeEventListener("mousemove", timeMouseMove);
    };
  }, []);

  var openView = open || movement.current.moving;
  return (
    <ThemeProvider theme={timeViewTheme}>
      <CssBaseline />
      <div
        id="youtime-movable"
        style={{
          position: "absolute",
          left: 5,
          top: 5,
          visibility: "visible",
          zIndex: "55",
        }}
        onMouseDown={timeMouseDown}
      >
        {!videoData.DisableSite && !dataPackage.current.stopExtension && (
          <div
            id="time-view-container"
            ref={viewRef}
            className="time-container"
          >
            <div
              className={
                "menu-button-container " +
                (openView ? "menu-open-container" : "")
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
                "time-button-container " +
                (openView ? "time-open-container" : "")
              }
            >
              <Button
                variant="contained"
                className={"time-button " + (openView ? "time-open" : "")}
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
                "cancel-button-container " +
                (openView ? "cancel-open-container" : "")
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
      </div>
    </ThemeProvider>
  );
}

export default TimeView;
