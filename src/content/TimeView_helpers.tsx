import { createTheme } from "@mui/material";
import { runtime, storage } from "webextension-polyfill";
import {
  DataPackage,
  MessageAction,
  StorageDataType,
  VideoDataType,
} from "../types/types.d";

export function dataAction(
  msg: MessageAction,
  dataPackage: React.RefObject<DataPackage>,
) {
  if (dataPackage.current.contentInterval) {
    clearInterval(dataPackage.current.contentInterval);
  }
  if (dataPackage.current.videoID.length === 0 || dataPackage.current.pause) {
    return;
  }
  var videoID = dataPackage.current.videoID;
  storage.local
    .get(["ExpireTime", "ResetTime", "RefreshTime", videoID])
    .then((item) => {
      let video = item[videoID] as VideoDataType;
      let storageData = item as StorageDataType;
      let refreshTime =
        storageData.RefreshTime ?? dataPackage.current.refreshTime;
      let resetTime = storageData.ResetTime ?? dataPackage.current.resetTime;
      let newVideoData = {
        ...dataPackage.current.videoData,
        ...video,
      };

      if (video && video.expiration && video.expiration <= Date.now() / 1000) {
        newVideoData = {
          hours: 0,
          minutes: 0,
          seconds: 0,
          expiration: Date.now() / 1000 + 86400,
        };
      }
      if (msg.value) {
        if (msg.value.ExpireTime) {
          newVideoData = {
            ...newVideoData,
            expiration: Date.now() / 1000 + msg.value.ExpireTime * 86400,
          };
        }
        if (msg.value.DisableSite !== undefined) {
          newVideoData = {
            ...newVideoData,
            DisableSite: msg.value.DisableSite,
          };
        }
        if (msg.value.RefreshTime) {
          refreshTime = msg.value.RefreshTime;
        }
        if (msg.value.ResetTime) {
          resetTime = msg.value.ResetTime;
        }
      }

      storage.local.set({ [videoID]: newVideoData });
      dataPackage.current.refreshTime = refreshTime;
      dataPackage.current.resetTime = resetTime;
      dataPackage.current.setVideoData(newVideoData);

      if (!newVideoData.DisableSite) {
        dataPackage.current.contentInterval = setInterval(() => {
          contentLoop(dataPackage);
        }, refreshTime * 1000);
      }
    });
}

export function contentLoop(dataPackage: React.RefObject<DataPackage>) {
  //TODO: check reset time
  var player = document.querySelector(".video-stream") as HTMLVideoElement;
  var adCheck1 = document.querySelector(".ytp-ad-button");
  var adCheck2 = document.querySelector(".ytp-ad-avatar");
  var child = document.querySelector("#youtime-movable");
  var childBounds = child.getBoundingClientRect();
  var parent = document.getElementById("player-container-inner");
  var globalPos = parent.getBoundingClientRect();
  if (
    player &&
    dataPackage.current.videoID.length > 0 &&
    !adCheck1 &&
    !adCheck2 &&
    !dataPackage.current.pause
  ) {
    var currentTime = player.currentTime;
    var newVideoData = {
      ...dataPackage.current.videoData,
      ...timeValues(currentTime),
    };
    if (!compare(dataPackage.current.videoData, newVideoData)) {
      dataPackage.current.setVideoData(newVideoData);
      storage.local.set({
        [dataPackage.current.videoID]: newVideoData,
      });
    }
  }
}

function timeValues(currentTime: number) {
  var sec_num = Math.floor(currentTime);
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - hours * 3600) / 60);
  var seconds = sec_num - hours * 3600 - minutes * 60;

  return { hours: hours, minutes: minutes, seconds: seconds };
}

function compare(vid1: VideoDataType, vid2: VideoDataType) {
  if (
    vid1.seconds !== vid2.seconds ||
    vid1.minutes !== vid2.minutes ||
    vid1.hours !== vid2.hours ||
    vid1.expiration !== vid2.expiration ||
    vid1.DisableSite !== vid2.DisableSite
  ) {
    return false;
  }

  return true;
}

export function grabVideoID() {
  var url = window.location.search;
  var urlQueries = new URLSearchParams(url);
  var videoID = urlQueries.get("v") ?? "";
  return videoID;
}

export function initialVideoData() {
  return {
    hours: 0,
    minutes: 0,
    seconds: 0,
    expiration: Date.now() / 1000 + 86400,
    DisableSite: false,
  };
}

export const theme = createTheme({
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
