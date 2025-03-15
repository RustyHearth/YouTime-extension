export declare type MessageType = {
  RefreshTime?: number;
  ResetTime?: number;
  ExpireTime?: number;
  DisableSite?: boolean;
};

export declare type MessageContentType = {
  refreshTime2?: number;
};

export declare type MessageAction = {
  action: string;
  value: MessageType;
};

export declare type VideoDataType = {
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
};

export declare type DataPackage = {
  videoID: string;
  videoData: VideoDataType;
  refreshTime: number;
  resetTime: number;
  contentInterval: NodeJS.Timer;
  setVideoData: React.Dispatch<React.SetStateAction<VideoDataType>>;
  pause: boolean;
};
