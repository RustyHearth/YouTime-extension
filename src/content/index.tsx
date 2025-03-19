import React from "react";
import { createRoot } from "react-dom/client";
import TimeView from "./TimeView";

class Content {
  pageIntervalID: NodeJS.Timer | undefined;
  constructor() {
    this.init();
  }
  init = () => {
    this.pageIntervalID = setInterval(this.pageLoad, 500);
  };
  appendButton = (append: HTMLElement) => {
    var element = document.createElement("div");
    var appendBounds = append.getBoundingClientRect();
    element.id = "youtime-frame";
    element.className = "youtime-frame";
    element.style.position = "absolute";
    element.style.visibility = "hidden";
    element.style.left = appendBounds.left.toString() + "px";
    element.style.top = appendBounds.top.toString() + "px";
    element.style.paddingLeft = "5px";
    element.style.paddingTop = "5px";
    element.style.zIndex = "55";
    var root = createRoot(element);
    root.render(<TimeView />);
    document.querySelector("body")?.appendChild(element);
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
