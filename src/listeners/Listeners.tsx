import { SelectChangeEvent } from "@mui/material";
import { runtime } from "webextension-polyfill";
import {
  MessageAction,
  MessageTransfer,
  ExtensionValues,
} from "../types/types.d";

export function CheckboxListener(
  event: React.ChangeEvent<HTMLInputElement>,
  checked: boolean,
  callback?: Function,
) {
  mainInputListener({ [event.target.id]: checked }, callback);
}

export function TextFieldListener(
  event: React.ChangeEvent<HTMLInputElement>,
  callback?: Function,
) {
  mainInputListener({ [event.target.id]: event.target.value }, callback);
}

export function SelectListener(
  id: string,
  event: SelectChangeEvent,
  callback?: Function,
) {
  mainInputListener({ [id]: event.target.value }, callback);
}

function mainInputListener(message: ExtensionValues, callback?: Function) {
  runtime
    .sendMessage({
      action: MessageAction.SetStorage,
      value: message,
    } as MessageTransfer)
    .then(() => {
      if (callback) {
        callback();
      }
    });
}
