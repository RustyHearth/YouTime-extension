import Browser, { storage, tabs } from "webextension-polyfill";
import { MessageTransfer, StorageDataType } from "../types/types.d";

type StorageCallback = (storage: StorageDataType, videoID: string) => void;

export function getActiveVideoTab(tabCallback: Function) {
  tabs.query({ active: true }).then((activeTabs) => {
    const videoID =
      new URLSearchParams(activeTabs[0].url?.split("?")[1] ?? "").get("v") ??
      "";
    tabCallback.call(this as Function, videoID);
  });
}

export function getStorageData(
  storageCallback: StorageCallback,
  activeTab: boolean = false,
  videoID?: string,
) {
  var call = (callbackVideoID: string) => {
    storage.local
      .get([
        "ExpireTime",
        "RefreshTime",
        "ResetTime",
        "StopExtension",
        callbackVideoID,
      ])
      .then((storageData) => {
        storageCallback.call(
          this as Function,
          storageData as StorageDataType,
          callbackVideoID,
        );
      });
  };
  if (activeTab) {
    getActiveVideoTab(call);
  } else {
    call(videoID ?? "");
  }
}

export function setStorageData(
  data: MessageTransfer,
  passToTabs: boolean = false,
  activeOnly: boolean = false,
) {
  storage.local.set({ ...data.value }).then(() => {
    if (!passToTabs) {
      return;
    }
    let query: Browser.Tabs.QueryQueryInfoType = {
      url: "*://*.youtube.com/*",
    };
    if (activeOnly) {
      query = {
        active: true,
        ...query,
      };
    }
    tabs.query(query).then((tabsList) => {
      tabsList.forEach((tab) => {
        if (tab.id) {
          tabs.sendMessage(tab.id, { ...data });
        }
      });
    });
  });
}
