export declare type ExtensionValues = {
  RefreshTime?: number;
  ResetTime?: number;
  ExpireTime?: number;
  DisableSite?: boolean;
  StopExtension?: boolean;
};

export enum MessageAction {
  Init,
  PageRefresh,
  SetStorage,
  DataChange,
  TimeJump,
  VideoClear,
  ClearAll,
}

export declare type MessageTransfer = {
  action: MessageAction;
  value: ExtensionValues;
};

export declare type VideoDataType = {
  title?: string;
  hours?: number;
  minutes?: number;
  seconds?: number;
  expiration?: number;
  DisableSite?: boolean;
};

export declare type StorageDataType = {
  RefreshTime?: number;
  ResetTime?: number;
  ExpireTime?: number;
  StopExtension?: boolean;
};

export declare type DataPackage = {
  videoID: string;
  videoData: VideoDataType;
  initializedData: boolean;
  firstData: boolean;
  refreshTime: number;
  resetTime: number;
  contentInterval: React.RefObject<NodeJS.Timer | null>;
  timeLapse: number;
  pause: boolean;
  StopExtension: boolean;
};

export declare type VideoSearch = {
  id: string;
  videoData: VideoDataType;
};
