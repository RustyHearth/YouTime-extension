import { runtime, tabs, storage, Runtime, Tabs } from "webextension-polyfill";
import { getStorageData, setStorageData } from "../helpers/extension_helper";
import {
  MessageAction,
  MessageTransfer,
  StorageDataType,
  VideoDataType,
} from "../types/types.d";

const youtubeURL = new RegExp("youtube.com");

class Background {
  constructor() {
    this.init();
  }

  init = () => {
    runtime.onMessage.addListener(this.onMessage);
    tabs.onUpdated.addListener(this.updated);
  };
  onMessage = async (msg: unknown, sender: Runtime.MessageSender) => {
    var request = msg as MessageTransfer;
    switch (request.action) {
      case MessageAction.SetStorage:
        setStorageData(request, true, request.value.DisableSite !== undefined);

        break;
      case MessageAction.TimeJump:
        if (sender.tab) {
          var videoData = request.value as VideoDataType;
          var time =
            (videoData.seconds ?? 0) +
            (videoData.minutes ?? 0) * 60 +
            (videoData.hours ?? 0) * 3600;
          var url = (sender.tab?.url ?? "").split("?");
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
      case MessageAction.ClearAll:
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
    return Promise.resolve("Message Received");
  };

  updated = async (
    tabId: number,
    _: Tabs.OnUpdatedChangeInfoType,
    tab: Tabs.Tab,
  ) => {
    if (youtubeURL.test(tab.url)) {
      tabs.sendMessage(tabId, {
        action: MessageAction.PageRefresh,
        value: {},
      } as MessageTransfer);
    }
  };
}

export const background = new Background();
