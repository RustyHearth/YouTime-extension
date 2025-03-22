import {
  Autocomplete,
  debounce,
  Grid2,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import {
  deleteVideo,
  getVideos,
  isVideoTabOpen,
} from "../helpers/extension_helper";
import { VideoSearch } from "../types/types.d";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
import AirlineStopsOutlinedIcon from "@mui/icons-material/AirlineStopsOutlined";
import { TooltipStyle } from "../themes/MainTheme";
import { tabs } from "webextension-polyfill";
const searchOptions = debounce(
  async (
    input: string,
    callback: (results: readonly VideoSearch[]) => void,
  ) => {
    var videos = await getVideos();
    var newVideos =
      input === ""
        ? videos
        : videos.filter((item) =>
            item.videoData.title.toLowerCase().includes(input.toLowerCase()),
          );
    callback(newVideos);
  },
  300,
);

const emptyOptions = [] as VideoSearch[];
function SearchComplete(props) {
  var animation = useRef<Animation | null>(null);
  var [inputValue, setInputValue] = useState<string>("");
  var [options, setOptions] = useState<readonly VideoSearch[]>(emptyOptions);

  useEffect(() => {
    searchOptions(inputValue, (results) => {
      setOptions(results);
    });
  }, [inputValue]);

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    var target = event.currentTarget as HTMLDivElement;
    var text = target.querySelector(".text-scroll") as HTMLElement;
    if (animation.current) {
      animation.current.cancel();
    }
    var viewWidth = target.getBoundingClientRect().width;
    var scrollWidth = text.scrollWidth;
    animation.current = text.animate(
      [
        {
          transform: `translateX(${target.getBoundingClientRect().width.toString()}px)`,
        },
        {
          transform: `translateX(-${text.scrollWidth}px)`,
        },
      ],
      {
        duration: 7000 * (scrollWidth / viewWidth),
        fill: "forwards",
        iterations: Infinity,
        endDelay: 2000,
      },
    );
  };
  const handleMouseLeave = () => {
    if (animation.current) {
      animation.current.cancel();
    }
  };
  const handleJump = (searchItem: VideoSearch) => {
    isVideoTabOpen(searchItem.id, (open, tabID) => {
      if (open) {
        tabs.update(tabID, { active: true });
      } else {
        var time =
          (searchItem.videoData.seconds ?? 0) +
          (searchItem.videoData.minutes ?? 0) * 60 +
          (searchItem.videoData.hours ?? 0) * 3600;
        tabs.create({
          active: true,
          url: `https://www.youtube.com/watch?v=${searchItem.id}&t=${time}`,
        });
      }
    });
  };
  const handleDelete = (searchItem: VideoSearch) => {
    isVideoTabOpen(searchItem.id, (open) => {
      if (open) {
        return;
      }
      deleteVideo(searchItem.id);
      searchOptions(inputValue, (results) => {
        setOptions(results);
        if (animation.current) {
          animation.current.cancel();
        }
      });
    });
  };
  return (
    <Autocomplete
      {...props}
      slotProps={{
        listbox: { style: { height: 250, maxHeight: 250 } },
        paper: { style: { height: 250, maxHeight: 250 } },
        popper: { style: { height: 250, maxHeight: 250 } },
      }}
      options={options}
      filterOptions={(x) => x}
      value={options[0] ?? undefined}
      inputValue={inputValue}
      onInputChange={(_, input) => {
        setInputValue(input);
      }}
      renderInput={(params) => <TextField {...params} {...props} fullWidth />}
      renderOption={(_, option) => {
        var videoOption = option as VideoSearch;
        return (
          <Grid2
            container
            direction="row"
            style={{
              position: "relative",
              width: "100%",
              height: "60px",
              padding: 0,
              margin: "auto",
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Grid2
              style={{
                display: "flex",
                width: "calc(100% - 75px)",
                overflow: "hidden",
                whiteSpace: "nowrap",
                justifySelf: "auto",
                justifyContent: "start",
                height: "60px",
              }}
            >
              <Typography
                className="text-scroll"
                style={{
                  display: "flex",
                  width: "calc(100% - 75px)",
                  marginTop: "auto",
                  marginBottom: "auto",
                  height: "min-content",
                }}
              >
                {videoOption.videoData.title.trim()}
              </Typography>
            </Grid2>
            <Grid2
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "60px",
                width: "30px",
              }}
            >
              <IconButton
                aria-label="Jump"
                style={{
                  display: "flex",
                  width: "24px",
                  height: "24px",
                }}
                onClick={() => {
                  handleJump(videoOption);
                }}
              >
                <TooltipStyle title="Jump or Open in new tab">
                  <AirlineStopsOutlinedIcon />
                </TooltipStyle>
              </IconButton>
            </Grid2>
            <Grid2
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "60px",
                width: "30px",
              }}
            >
              <IconButton
                aria-label="Search"
                style={{
                  display: "flex",
                  width: "24px",
                  height: "24px",
                }}
                onClick={() => {
                  handleDelete(videoOption);
                }}
              >
                <ClearOutlinedIcon />
              </IconButton>
            </Grid2>
          </Grid2>
        );
      }}
    />
  );
}

export default SearchComplete;
