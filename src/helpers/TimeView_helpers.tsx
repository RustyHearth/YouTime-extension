import { storage } from "webextension-polyfill";
import { compareVideo, timeValues } from "./data_helpers";
import { getStorageData } from "./extension_helper";
import { DataPackage, MessageAction, VideoDataType } from "../types/types.d";

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
  getStorageData(
    (storageData) => {
      let video = storageData[videoID] as VideoDataType;
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
      dataPackage.current.refreshTime = refreshTime;
      dataPackage.current.resetTime = resetTime;
      dataPackage.current.stopExtension = storageData.StopExtension;
      dataPackage.current.setVideoData(newVideoData);

      if (!newVideoData.DisableSite && !storageData.StopExtension) {
        storage.local.set({ [videoID]: newVideoData });
        dataPackage.current.contentInterval = setInterval(() => {
          contentLoop(dataPackage);
        }, refreshTime * 1000);
      }
    },
    false,
    videoID,
  );
}

export function contentLoop(dataPackage: React.RefObject<DataPackage>) {
  //TODO: check reset time
  var player = document.querySelector(".video-stream") as HTMLVideoElement;
  var adCheck1 = document.querySelector(".ytp-ad-button");
  var adCheck2 = document.querySelector(".ytp-ad-avatar");
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
    if (!compareVideo(dataPackage.current.videoData, newVideoData)) {
      dataPackage.current.setVideoData(newVideoData);
      storage.local.set({
        [dataPackage.current.videoID]: newVideoData,
      });
    }
  }
}
