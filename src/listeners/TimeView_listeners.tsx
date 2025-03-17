export interface Movement {
  downClickTime: number;
  mouseDown: boolean;
  moving: boolean;
  viewOffsetX: number;
  viewOffsetY: number;
  clickOffsetX: number;
  clickOffsetY: number;
  posX: number;
  posY: number;
}

export const mouseMove = (
  event: MouseEvent,
  movement: React.RefObject<Movement>,
) => {
  if (
    movement.current.mouseDown &&
    Date.now() - movement.current.downClickTime > 150
  ) {
    var target = document.getElementById("youtime-movable");
    movement.current.moving = true;
    var containedPosX: number = event.pageX - movement.current.viewOffsetX;
    var containedPosY: number = event.pageY - movement.current.viewOffsetY;
    target.style.left =
      (containedPosX - movement.current.clickOffsetX).toString() + "px";
    target.style.top =
      (containedPosY - movement.current.clickOffsetY).toString() + "px";
  }
};

export const mouseDown = (
  event: React.MouseEvent<HTMLDivElement>,
  movement: React.RefObject<Movement>,
) => {
  movement.current.downClickTime = Date.now();
  var childBounds = event.currentTarget.getBoundingClientRect();
  var parent = document.getElementById("player-container-inner");
  var globalPos = parent.getBoundingClientRect();
  movement.current = {
    ...movement.current,
    viewOffsetX: globalPos.left,
    viewOffsetY: globalPos.top,
    clickOffsetX: event.pageX - childBounds.x,
    clickOffsetY: event.pageY - childBounds.y,
  };
  movement.current.mouseDown = true;
};
export const mouseUp = async (
  event: MouseEvent,
  movement: React.RefObject<Movement>,
) => {
  movement.current.downClickTime = Date.now();
  movement.current.mouseDown = false;
  setTimeout(() => {
    movement.current.moving = false;
  }, 100);
};
