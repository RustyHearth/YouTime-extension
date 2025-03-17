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
    element.id = "youtime-frame";
    element.className = "youtime-frame";
    element.style.position = "absolute";
    element.style.visibility = "hidden";
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
