import { MessageType, VideoDataType } from "../types/types.d";

export function compareStorage(obj1: MessageType, obj2: MessageType) {
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

export function compareVideo(vid1: VideoDataType, vid2: VideoDataType) {
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

export function timeValues(currentTime: number) {
  var sec_num = Math.floor(currentTime);
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - hours * 3600) / 60);
  var seconds = sec_num - hours * 3600 - minutes * 60;

  return { hours: hours, minutes: minutes, seconds: seconds };
}
