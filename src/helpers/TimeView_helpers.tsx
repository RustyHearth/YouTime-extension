import { storage } from "webextension-polyfill";
import { compareObjects, timeValues } from "./data_helpers";
import { getStorageData } from "./extension_helper";
import { DataPackage, ExtensionValues, VideoDataType } from "../types/types.d";

export function initData(
  dataPackage: DataPackage,
  setDataPackage: React.Dispatch<React.SetStateAction<DataPackage>>,
) {
  getStorageData(
    (storageData) => {
      const videoData =
        (storageData[dataPackage.videoID] as VideoDataType) ?? null;

      var newVideoData = {
        ...dataPackage.videoData,
        ...videoData,
      };
      var newDataPackage = {
        ...dataPackage,
        videoData: newVideoData,
        refreshTime: storageData.RefreshTime ?? 5,
        resetTime: storageData.ResetTime ?? 15,
        StopExtension: storageData.StopExtension ?? false,
        timeLapse: 0,
        initializedData: true,
        pause: false,
      };
      if (!videoData) {
        newDataPackage = {
          ...newDataPackage,
          firstData: true,
        };
      }

      setDataPackage(newDataPackage);
      runLoop(newDataPackage, setDataPackage);
    },
    false,
    dataPackage.videoID,
  );
}

export function dataChange(
  newValue: ExtensionValues,
  dataPackage: DataPackage,
  setDataPackage: React.Dispatch<React.SetStateAction<DataPackage>>,
) {
  var newDataPackage = {
    ...dataPackage,
  };
  var newVideoData = dataPackage.videoData;

  if (newValue) {
    if (newValue.ExpireTime) {
      newVideoData = {
        ...newVideoData,
        expiration: Date.now() / 1000 + newValue.ExpireTime * 86400,
      };
    }
    if (newValue.DisableSite !== undefined) {
      newVideoData = {
        ...newVideoData,
        DisableSite: newValue.DisableSite,
      };
    }
    if (newValue.RefreshTime) {
      newDataPackage = {
        ...newDataPackage,
        refreshTime: newValue.RefreshTime,
      };
    }
    if (newValue.ResetTime) {
      newDataPackage = {
        ...newDataPackage,
        resetTime: newValue.ResetTime,
      };
    }
    if (newValue.StopExtension !== undefined) {
      newDataPackage = {
        ...newDataPackage,
        StopExtension: newValue.StopExtension,
      };
    }
    newDataPackage = {
      ...newDataPackage,
      videoData: { ...newVideoData },
    };
  }
  storage.local.set({ [newDataPackage.videoID]: newVideoData });
  setDataPackage(newDataPackage);
  runLoop(newDataPackage, setDataPackage);
}

export function runLoop(
  dataPackage: DataPackage,
  setDataPackage: React.Dispatch<React.SetStateAction<DataPackage>>,
) {
  if (
    dataPackage.contentInterval !== null &&
    dataPackage.contentInterval.current !== null
  ) {
    clearInterval(dataPackage.contentInterval.current);
  }
  if (
    dataPackage.StopExtension ||
    dataPackage.pause ||
    dataPackage.videoData.DisableSite
  ) {
    return;
  }
  dataPackage.contentInterval.current = setInterval(() => {
    contentLoop(setDataPackage);
  }, dataPackage.refreshTime * 1000);
}

function contentLoop(
  setDataPackage: React.Dispatch<React.SetStateAction<DataPackage>>,
) {
  setDataPackage((prevState) => {
    var player = document.querySelector(".video-stream") as HTMLVideoElement;
    var adCheck1 = document.querySelector(".ytp-ad-button") as HTMLElement;
    var adCheck2 = document.querySelector(".ytp-ad-avatar") as HTMLElement;
    var title = document.querySelector(
      "#title yt-formatted-string",
    ) as HTMLElement;
    const currentTime: number = player.currentTime;
    var newVideoData = {
      ...prevState.videoData,
      ...timeValues(currentTime),
      title: title.innerText.trim(),
    } as VideoDataType;
    var newDataPackage = {
      ...prevState,
    } as DataPackage;
    if (
      !player ||
      prevState.videoID.length <= 0 ||
      adCheck1 ||
      adCheck2 ||
      prevState.pause
    ) {
      return prevState;
    }
    if (prevState.timeLapse <= prevState.resetTime && !prevState.firstData) {
      newDataPackage = {
        ...prevState,
        timeLapse: prevState.timeLapse + prevState.refreshTime,
      };
      return newDataPackage;
    }
    if (prevState.firstData) {
      newDataPackage = {
        ...prevState,
        timeLapse: prevState.resetTime + 1,
        firstData: false,
      };
    }

    if (!compareObjects(prevState.videoData, newVideoData, [])) {
      storage.local.set({
        [prevState.videoID]: newVideoData,
      });
      return {
        ...newDataPackage,
        videoData: newVideoData,
      };
    }
    return newDataPackage;
  });
}
