import Browser, {
  runtime,
  tabs,
  storage,
  Runtime,
} from "webextension-polyfill";
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
  onMessage = async (msg: unknown, sender: Runtime.MessageSender) => {
    var request = msg as MessageAction;

    switch (request.action) {
      case "setStorage":
        storage.local
          .set(
            request.value.DisableSite !== undefined ? {} : { ...request.value },
          )
          .then(() => {
            let query: Browser.Tabs.QueryQueryInfoType = {
              url: "*://*.youtube.com/*",
            };
            if (request.value.DisableSite) {
              query = {
                active: true,
                ...query,
              };
            }
            tabs.query(query).then((tabsList) => {
              tabsList.forEach((tab) => {
                if (tab.id) {
                  console.log(`active tab: ${JSON.stringify(tab)}`);
                  request.action = "dataChange";
                  tabs.sendMessage(tab.id, request);
                }
              });
            });
          });

        break;
      case "timeJump":
        if (sender.tab) {
          var videoData = request.value as VideoDataType;
          var url = sender.tab.url.split("?");
          var mainURL = url[0];
          var query = url[1] ?? "";
          var queryParams = new URLSearchParams(query);
          if (queryParams.has("t")) {
            queryParams.delete("t");
          }
          var time =
            (videoData.seconds ?? 0) +
            (videoData.minutes ?? 0) * 60 +
            (videoData.hours ?? 0) * 3600;
          queryParams.append("t", time.toString());
          mainURL = `${mainURL}?${queryParams.toString()}`;
          tabs.update(sender.tab.id, { url: mainURL });
        }
        break;
      case "clearAll":
        storage.local
          .get(["ExpireTime", "ResetTime", "RefreshTime"])
          .then((item) => {
            var data = item as StorageDataType;
            storage.local.clear().then(() => {
              storage.local.set(data);
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
