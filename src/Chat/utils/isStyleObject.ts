export const isStyleObject = (object: unknown): boolean => {
  return typeof object === "object" && object !== null;
};
