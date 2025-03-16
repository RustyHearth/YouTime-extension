import React, { useEffect, useMemo, useRef, useState } from "react";
import { runtime, storage } from "webextension-polyfill";
import { DataPackage, MessageAction, VideoDataType } from "../types/types.d";
import "./TimeView.css";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import styled from "styled-components/native";

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

interface Movement {
  mouseDown: boolean;
  moving: boolean;
  viewOffsetX: number;
  viewOffsetY: number;
  clickOffsetX: number;
  clickOffsetY: number;
  posX: number;
  posY: number;
}
function TimeView(): React.JSX.Element {
  var videoID = grabVideoID();
  var time = useRef<number>(Date.now());
  var movement = useRef<Movement>({
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
  const mouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    time.current = Date.now();
    var childBounds = event.currentTarget.getBoundingClientRect();
    var parent = document.getElementById("player-container-inner");
    var globalPos = parent.getBoundingClientRect();
    movement.current = {
      ...movement.current,
      viewOffsetX: globalPos.left,
      viewOffsetY: globalPos.top,
      clickOffsetX: event.pageX - childBounds.x,
      clickOffsetY: event.pageY - childBounds.y,
    };
    movement.current.mouseDown = true;
  };
  const mouseUp = async (event: MouseEvent) => {
    time.current = Date.now();
    movement.current.mouseDown = false;
    setTimeout(() => {
      movement.current.moving = false;
    }, 100);
  };
  useEffect(() => {
    document.addEventListener("mouseup", mouseUp);
    document.addEventListener("mousemove", mouseMove);
    return () => {
      document.removeEventListener("mouseup", mouseUp);
      document.removeEventListener("mousemove", mouseMove);
    };
  }, []);
  const mouseMove = (event: MouseEvent) => {
    if (movement.current.mouseDown && Date.now() - time.current > 150) {
      var target = document.getElementById("youtime-movable");
      movement.current.moving = true;
      var containedPosX: number = event.pageX - movement.current.viewOffsetX;
      var containedPosY: number = event.pageY - movement.current.viewOffsetY;
      target.style.left =
        (containedPosX - movement.current.clickOffsetX).toString() + "px";
      target.style.top =
        (containedPosY - movement.current.clickOffsetY).toString() + "px";
    }
  };
  var openView = open || movement.current.moving;
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div
        id="youtime-movable"
        style={{ position: "absolute", left: 5, top: 5, visibility: "visible" }}
        onMouseDown={mouseDown}
      >
        {!videoData.DisableSite && (
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
