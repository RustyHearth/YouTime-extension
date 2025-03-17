import Browser, { storage, tabs } from "webextension-polyfill";
import { MessageAction, StorageDataType } from "../types/types.d";

type StorageCallback = (storage: StorageDataType, videoID: string) => void;

export function getActiveVideoTab(tabCallback: Function) {
  tabs.query({ active: true }).then((activeTabs) => {
    const videoID =
      new URLSearchParams(activeTabs[0].url?.split("?")[1] ?? "").get("v") ??
      "";
    tabCallback.call(this, videoID);
  });
}

export function getStorageData(
  storageCallback: StorageCallback,
  activeTab: boolean = false,
  videoID?: string,
) {
  console.log(`getStorageData1`);
  var call = (callbackVideoID: string) => {
    console.log(`getStorageData2`);
    storage.local
      .get([
        "ExpireTime",
        "RefreshTime",
        "ResetTime",
        "StopExtension",
        callbackVideoID,
      ])
      .then((storageData) => {
        console.log(`getStorageData3`);
        storageCallback.call(
          this,
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
  data: MessageAction,
  passToTabs: boolean = false,
  activeOnly: boolean = false,
) {
  console.log(`msg: ${JSON.stringify(data)}`);
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
