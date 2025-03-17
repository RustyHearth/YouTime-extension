import Browser, {
  runtime,
  tabs,
  storage,
  Runtime,
} from "webextension-polyfill";
import { getStorageData, setStorageData } from "../helpers/extension_helper";
import {
  MessageAction,
  StorageDataType,
  VideoDataType,
} from "../types/types.d";

class Background {
  constructor() {
    this.init();
  }

  init = () => {
    runtime.onMessage.addListener(this.onMessage);
    tabs.onUpdated.addListener(this.updated, { urls: ["*://*.youtube.com/*"] });
  };
  onMessage = async (msg: MessageAction, sender: Runtime.MessageSender) => {
    console.log(`msg: ${JSON.stringify(msg)}`);
    switch (msg.action) {
      case "setStorage":
        console.log(`msg: ${JSON.stringify(msg)}`);
        setStorageData(msg, true, msg.value.DisableSite);

        break;
      case "timeJump":
        if (sender.tab) {
          var videoData = msg.value as VideoDataType;
          var time =
            (videoData.seconds ?? 0) +
            (videoData.minutes ?? 0) * 60 +
            (videoData.hours ?? 0) * 3600;
          var url = sender.tab.url.split("?");
          var mainURL = url[0];
          var queryParams = new URLSearchParams(url[1] ?? "");
          if (queryParams.has("t")) {
            queryParams.delete("t");
          }

          queryParams.append("t", time.toString());
          mainURL = `${mainURL}?${queryParams.toString()}`;
          tabs.update(sender.tab.id, { url: mainURL });
        }
        break;
      case "clearAll":
        getStorageData((storageData) => {
          storage.local.clear().then(() => {
            storage.local.set({
              ResetTime: storageData.ResetTime,
              RefreshTime: storageData.RefreshTime,
              ExpireTime: storageData.ExpireTime,
              StopExtension: storageData.StopExtension,
            } as StorageDataType);
          });
        });

        break;
      default:
        break;
    }
    return true;
  };

  updated = async (tabId: number) => {
    tabs.sendMessage(tabId, { action: "pageRefresh" });
  };
}

export const background = new Background();
