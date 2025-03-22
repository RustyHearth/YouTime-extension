import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  ThemeProvider,
  Tooltip,
  Typography,
} from "@mui/material";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { runtime, storage } from "webextension-polyfill";
import { grabVideoID, initialVideoData } from "../helpers/data_helpers";
import { dataChange, initData } from "../helpers/TimeView_helpers";
import {
  mouseDown,
  mouseMove,
  mouseUp,
  Movement,
} from "../listeners/TimeView_listeners";
import { timeViewTheme } from "../themes/TimeView_theme";
import {
  DataPackage,
  MessageAction,
  MessageTransfer,
  VideoDataType,
} from "../types/types.d";
import MenuIcon from "@mui/icons-material/Menu";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import { TooltipStyle } from "../themes/MainTheme";
import "./TimeView.css";

var initialDataPackage = {
  videoID: grabVideoID(),
  videoData: initialVideoData(),
  initializedData: false,
  firstData: false,
  refreshTime: 5,
  resetTime: 15,
  contentInterval: null,
  timeLapse: 0,
  pause: false,
  StopExtension: false,
};

function TimeView(): React.JSX.Element {
  var viewRef = useRef<HTMLDivElement>(null);
  var contentInterval = useRef<NodeJS.Timer | null>(null);
  var [menuAnchor, setMenuAnchor] = useState<HTMLButtonElement | null>(null);
  var open = Boolean(menuAnchor);
  var [dataPackage, setDataPackage] = useState<DataPackage>({
    ...initialDataPackage,
    contentInterval: contentInterval,
  });
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
  var openView = open || movement.current.moving;
  var onMessage = useCallback(
    (msg: unknown) => {
      var request = msg as MessageTransfer;
      switch (request.action) {
        case MessageAction.Init:
          if (!dataPackage.initializedData) {
            initData(dataPackage, setDataPackage);
          }
          break;
        case MessageAction.PageRefresh:
          if (grabVideoID() !== dataPackage.videoID) {
            if (
              dataPackage.contentInterval !== null &&
              dataPackage.contentInterval.current !== null
            ) {
              clearInterval(dataPackage.contentInterval.current);
            }
            initData(
              {
                ...initialDataPackage,
                videoID: grabVideoID(),
                videoData: initialVideoData(),
                contentInterval: dataPackage.contentInterval,
              },
              setDataPackage,
            );
          }
          break;
        case MessageAction.SetStorage:
          dataChange(request.value, dataPackage, setDataPackage);
          break;
        default:
          break;
      }
    },
    [dataPackage],
  );
  useEffect(() => {
    onMessage({ action: MessageAction.Init, value: {} } as MessageTransfer);
    runtime.onMessage.addListener(onMessage);
    return () => {
      runtime.onMessage.removeListener(onMessage);
    };
  }, [dataPackage, onMessage]);
  useEffect(() => {
    document.addEventListener("mouseup", timeMouseUp);
    document.addEventListener("mousemove", timeMouseMove);
    return () => {
      document.removeEventListener("mouseup", timeMouseUp);
      document.removeEventListener("mousemove", timeMouseMove);
    };
  }, []);
  var timeText = useMemo(() => {
    var videoText = {
      hours:
        ((dataPackage.videoData.hours ?? 0) < 10 ? "0" : "") +
        (dataPackage.videoData.hours.toString() ?? "0"),
      minutes:
        ((dataPackage.videoData.minutes ?? 0) < 10 ? "0" : "") +
        (dataPackage.videoData.minutes.toString() ?? "0"),
      seconds:
        ((dataPackage.videoData.seconds ?? 0) < 10 ? "0" : "") +
        (dataPackage.videoData.seconds.toString() ?? "0"),
    };
    return (
      <Typography
        style={{
          fontFamily: "monospace",
          letterSpacing: -1,
          fontSize: 18,
        }}
      >
        {videoText.hours + ":" + videoText.minutes + ":" + videoText.seconds}
      </Typography>
    );
  }, [dataPackage]);

  const timeMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    mouseDown(event, movement);
  };
  const timeMouseMove = (event: MouseEvent) => {
    mouseMove(event, movement);
  };
  const timeMouseUp = async () => {
    mouseUp(movement);
  };
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!movement.current.moving) {
      setMenuAnchor(event.currentTarget);
    }
  };
  const handleClose = () => {
    setMenuAnchor(null);
  };
  const handleClearData = () => {
    storage.local.remove(dataPackage.videoID).then(() => {
      dataPackage.videoData = initialVideoData();
      initData(
        {
          ...initialDataPackage,
          videoID: grabVideoID(),
          videoData: initialVideoData(),
        },
        setDataPackage,
      );
    });
    handleClose();
  };
  const handlePause = () => {
    setDataPackage({
      ...dataPackage,
      pause: !dataPackage.pause,
    });
    handleClose();
  };
  const timeJump = (videoData: VideoDataType) => {
    if (!movement.current.moving) {
      runtime.sendMessage({
        action: MessageAction.TimeJump,
        value: videoData,
      });
    }
  };
  const handleDisable = () => {
    dataChange({ DisableSite: true }, dataPackage, setDataPackage);
    handleClose();
  };
  const cancelButton = (ref: HTMLDivElement) => {
    if (!movement.current.moving) {
      ref.remove();
    }
  };
  return (
    <ThemeProvider theme={timeViewTheme}>
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
        {!dataPackage.videoData.DisableSite && !dataPackage.StopExtension && (
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
                  <TooltipStyle
                    title="Clears Data and Starts Reset Time again."
                    placement="right"
                  >
                    <p style={{ width: "100%", height: "100%" }}>
                      Clear Video Data
                    </p>
                  </TooltipStyle>
                </MenuItem>
                <MenuItem onClick={handlePause}>
                  <Tooltip
                    title="Pause until refresh or toggle."
                    placement="right"
                  >
                    <p style={{ width: "100%", height: "100%" }}>
                      {!dataPackage.pause && "Pause"}
                      {dataPackage.pause && "Resume"}
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
                  timeJump(dataPackage.videoData);
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
