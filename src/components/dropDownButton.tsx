import {
  FormControl,
  Grid2,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  SxProps,
} from "@mui/material";
import React from "react";

export interface DropType {
  id: string;
  label: string;
  width: string;
  height?: string;
  onChange?: (
    id: string,
    event: SelectChangeEvent,
    child: React.ReactNode,
  ) => void;
  sx?: SxProps;
  items?: any[];
  initialValue?: number;
}

export function numArray(start: number, end: number, increment: number) {
  let numArray: number[] = [];
  for (let index = start; index < end; index += increment) {
    numArray.push(index);
  }
  return numArray;
}

function DropdownButton({
  id,
  label,
  width,
  ...props
}: DropType): React.JSX.Element {
  var initialValue = props.initialValue
    ? props.initialValue
    : props.items
      ? props?.items[0]
      : "";
  var [currentVal, setCurrentVal] = React.useState<string>(initialValue);
  if (initialValue !== currentVal) {
    setCurrentVal(initialValue);
  }
  const handleChange = (event: SelectChangeEvent, child: React.ReactNode) => {
    setCurrentVal(event.target.value);
    if (props.onChange != null) {
      props.onChange(id, event, child);
    }
  };

  let items: React.JSX.Element[] = [];

  props.items?.forEach((element) => {
    let key = `${id}${element}`;

    items.push(
      <MenuItem
        key={key}
        id={key}
        value={element}
        style={{
          width: "100%",
          height: "40px",
          justifyContent: "center",
          fontSize: "14px",
        }}
      >
        {element}
      </MenuItem>,
    );
  });
  const labelID = `${id}-label`;
  return (
    <Grid2 sx={props.sx}>
      <FormControl style={{}} fullWidth>
        <Select
          id={id}
          label={label}
          labelId={labelID}
          onChange={handleChange}
          value={currentVal}
          size="small"
          MenuProps={{
            style: {
              textAlign: "center",
            },
            sx: {
              height: "250px",
            },
            slotProps: {
              root: {
                sx: {
                  width: "10%",
                  margin: "0",
                  padding: "0",
                  textAlign: "center",
                },
              },
            },
          }}
          style={{
            width: "100%",
            height: "unset",
            margin: "0",
            padding: "0",
          }}
        >
          {items}
        </Select>
        <InputLabel
          id={labelID}
          style={{
            height: "unset",
          }}
        >
          {label}
        </InputLabel>
      </FormControl>
    </Grid2>
  );
}
export default DropdownButton;
