import { ExtensionValues, VideoDataType } from "../types/types.d";

export function grabVideoID() {
  var url = window.location.search;
  var urlQueries = new URLSearchParams(url);
  var videoID = urlQueries.get("v") ?? "";
  return videoID;
}

export function initialVideoData(): VideoDataType {
  return {
    title: "",
    hours: 0,
    minutes: 0,
    seconds: 0,
    expiration: Date.now() / 1000 + 86400,
    DisableSite: false,
  };
}

export function timeValues(currentTime: number): VideoDataType {
  var sec_num = Math.floor(currentTime);
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - hours * 3600) / 60);
  var seconds = sec_num - hours * 3600 - minutes * 60;

  return { hours: hours, minutes: minutes, seconds: seconds };
}
export function compareObjects(obj1, obj2, exclude): boolean {
  if (obj1 === null || obj2 === null) {
    return obj1 === obj2;
  }
  if (obj1 === obj2) {
    return true;
  }

  var obj1Keys = Object.keys(obj1);
  var obj2Keys = Object.keys(obj2);
  if (obj1Keys.length !== obj2Keys.length) {
    return false;
  }

  if (obj1Keys.length === 0 || obj2Keys.length === 0) {
    return obj1 === obj2;
  }
  var keys = (key) => {
    if (exclude.includes(key)) {
      return true;
    }
    return compareObjects(obj1[key], obj2[key], exclude);
  };
  return obj1Keys.every(keys);
}
