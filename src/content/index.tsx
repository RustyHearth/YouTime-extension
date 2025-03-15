import { createRoot } from "react-dom/client";
import { VideoDataType } from "../types/types.d";
import TimeView from "./TimeView";

class Content {
  url = window.location.search;
  urlQueries = new URLSearchParams(this.url);
  videoID = this.urlQueries.get("v") ?? "";
  videoData: VideoDataType = {
    hours: 0,
    minutes: 0,
    seconds: 0,
    expiration: Date.now() / 1000 + 86400,
    DisableSite: false,
  };

  intervalID: NodeJS.Timer | undefined;
  pageIntervalID: NodeJS.Timer | undefined;
  resetIntervalID: NodeJS.Timer | undefined;
  RefreshTime: number = 5000;
  ResetTime: number = 15;

  constructor() {
    this.init();
  }

  init = () => {
    this.pageIntervalID = setInterval(this.pageLoad, 500);
  };

  timeValues = (currentTime: number) => {
    var sec_num = Math.floor(currentTime);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - hours * 3600) / 60);
    var seconds = sec_num - hours * 3600 - minutes * 60;

    return { hours: hours, minutes: minutes, seconds: seconds };
  };

  appendButton = (append: HTMLElement) => {
    var element = document.createElement("div");
    element.id = "youtime-frame";
    element.style.position = "absolute";
    element.style.left = "0";
    element.style.top = "0";
    element.style.paddingLeft = "5px";
    element.style.paddingTop = "5px";
    element.style.zIndex = "55";
    var root = createRoot(element);
    root.render(<TimeView />);
    append.appendChild(element);
  };

  pageLoad = () => {
    if (document.readyState === "complete") {
      var playerContainer = document.querySelector(
        "#player-container-inner",
      ) as HTMLElement;
      if (playerContainer) {
        this.appendButton(playerContainer);
        clearInterval(this.pageIntervalID);
      }
    }
  };
}

export const content = new Content();
