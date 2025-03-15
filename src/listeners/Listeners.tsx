import { SelectChangeEvent } from "@mui/material";
import { runtime, tabs } from "webextension-polyfill";
import { MessageType } from "../types/types.d";

export function CheckboxListener(
  event: React.ChangeEvent<HTMLInputElement>,
  checked: boolean,
) {
  mainInputListener({ [event.target.id]: checked });
}

export function TextFieldListener(event: React.ChangeEvent<HTMLInputElement>) {
  mainInputListener({ [event.target.id]: event.target.value });
}

export function SelectListener(id: string, event: SelectChangeEvent) {
  mainInputListener({ [id]: event.target.value });
}

function mainInputListener(message: MessageType) {
  runtime.sendMessage({
    action: "setStorage",
    value: message,
  });
}
