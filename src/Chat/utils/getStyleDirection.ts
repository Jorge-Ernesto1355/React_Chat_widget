export type Direction = "right" | "left";

export const LeftDirection = {
  bubble: "bottom-4 left-14",
  chatInterface: "bottom-16 left-24",
};

export const RightDirection = {
  bubble: "right-6 bottom-6",
  chatInterface: "bottom-16 right-32",
};

export const getStyleDirection = (
  direction: Direction
): { bubble: string; chatInterface: string } => {
  const directions: Record<
    Direction,
    { bubble: string; chatInterface: string }
  > = {
    right: RightDirection,
    left: LeftDirection,
  };

  return directions[direction] ?? { bubble: "", chatInterface: "" };
};
