import { useMemo } from "react";
import { useChatContext } from "../context/Context";

const sanitizeStyles = (
  styles: Record<string, any>
): Record<string, string> => {
  const allowedProperties = [
    "backgroundColor",
    "color",
    "fontSize",
    "fontWeight",
    "fontFamily",
    "padding",
    "margin",
    "border",
    "borderRadius",
    "width",
    "height",
    "minWidth",
    "maxWidth",
    "minHeight",
    "maxHeight",
    "display",
    "flexDirection",
    "justifyContent",
    "alignItems",
    "gap",
    "opacity",
    "transform",
    "transition",
  ];

  const dangerousPatterns = [
    /javascript:/i,
    /expression\s*\(/i,
    /url\s*\(/i,
    /import/i,
    /@import/i,
    /behavior:/i,
    /binding:/i,
    /-moz-binding/i,
    /vbscript:/i,
    /livescript:/i,
    /data:text\/html/i,
    /data:text\/javascript/i,
  ];

  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(styles)) {
    if (!allowedProperties.includes(key)) {
      console.warn("Invalid property", key);
      continue;
    }

    const stringValue = String(value);

    const hasDangerousPattern = dangerousPatterns.some((pattern) =>
      pattern.test(stringValue)
    );

    if (hasDangerousPattern) {
      console.warn(`Property Value CSS is dangerous ${key}: ${stringValue}`);
      continue;
    }

    if (key.includes("color") || key === "backgroundColor") {
      if (isValidColor(stringValue)) sanitized[key] = stringValue;
    } else if (
      key.includes("size") ||
      key.includes("width") ||
      key.includes("height")
    ) {
      if (isValidSize(stringValue)) sanitized[key] = stringValue;
    } else {
      sanitized[key] = stringValue;
    }
  }

  return sanitized;
};

const isValidColor = (color: string): boolean => {
  const colorPatterns = [
    /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, // Hex colors
    /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/, // RGB
    /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/, // RGBA
    /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/, // HSL
    /^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)$/, // HSLA
  ];

  const namedColors = [
    "transparent",
    "black",
    "white",
    "red",
    "green",
    "blue",
    "yellow",
    "orange",
    "purple",
    "pink",
    "gray",
    "grey",
  ];

  return (
    colorPatterns.some((pattern) => pattern.test(color)) ||
    namedColors.includes(color.toLowerCase())
  );
};

const isValidSize = (size: string): boolean => {
  const sizePattern = /^(\d*\.?\d+)(px|em|rem|%|vh|vw|ch|ex|cm|mm|in|pt|pc)$/;
  return sizePattern.test(size) || size === "auto" || size === "inherit";
};

const sanitizeClassName = (className: string): string => {
  if (typeof className !== "string") {
    return "";
  }

  if (className.trim() === "") return "";

  const cleaned = className
    .replace(/[<>{}()[\]"'`;\\]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/expression\s*\(/gi, "")
    .replace(/url\s*\(/gi, "")
    .trim();

  // Validar que solo contenga clases CSS válidas
  const classPattern = /^[a-zA-Z0-9\s\-_:./!]+$/;

  if (!classPattern.test(cleaned)) {
    console.warn(`ClassName invalid characters: ${className}`);
    return "";
  }

  // Limitar longitud para evitar ataques DoS
  if (cleaned.length > 1000) {
    console.warn(`className is too large: ${cleaned.length} characters`);
    return cleaned.substring(0, 1000);
  }

  return cleaned;
};

const isTailwindClass = (className: string): boolean => {
  const tailwindPrefixes = [
    // Layout
    "container",
    "box-",
    "block",
    "inline",
    "flex",
    "grid",
    "hidden",
    // Flexbox & Grid
    "flex-",
    "grid-",
    "col-",
    "row-",
    "gap-",
    "justify-",
    "items-",
    "content-",
    // Spacing
    "p-",
    "pt-",
    "pr-",
    "pb-",
    "pl-",
    "px-",
    "py-",
    "m-",
    "mt-",
    "mr-",
    "mb-",
    "ml-",
    "mx-",
    "my-",
    // Sizing
    "w-",
    "h-",
    "min-w-",
    "min-h-",
    "max-w-",
    "max-h-",
    // Typography
    "text-",
    "font-",
    "leading-",
    "tracking-",
    "align-",
    // Colors
    "bg-",
    "text-",
    "border-",
    "ring-",
    "divide-",
    "placeholder-",
    // Borders
    "border",
    "rounded",
    "ring-",
    "shadow-",
    // Effects
    "opacity-",
    "transition",
    "transform",
    "hover:",
    "focus:",
    "active:",
  ];

  return tailwindPrefixes.some((prefix) => className.startsWith(prefix));
};

export const useSafeStyles = () => {
  const context = useChatContext();

  const safeHeaderStyles = useMemo(() => {
    return sanitizeStyles(context.headerStyles ?? {});
  }, [context.headerStyles]);

  const safeHeaderClassName = useMemo(() => {
    const cleaned = sanitizeClassName(context.headerClassName ?? "");

    return cleaned
      .split(/\s+/)
      .filter((cls) => {
        if (!cls) return false;
        if (!isTailwindClass(cls)) {
          console.warn(`Class is not recognized as Tailwind: ${cls}`);
          return false;
        }

        return true;
      })
      .join(" ");
  }, [context.headerClassName]);

  const safeChatStyles = useMemo(() => {
    return sanitizeStyles(context.chatStyles ?? {});
  }, [context.chatStyles]);

  const safeChatClassName = useMemo(() => {
    const cleaned = sanitizeClassName(context.chatClassName ?? "");

    return cleaned
      .split(/\s+/)
      .filter((cls) => {
        if (!cls) return false;
        if (!isTailwindClass(cls)) {
          console.warn(`Class is not recognized as Tailwind: ${cls}`);
          return false;
        }

        return true;
      })
      .join(" ");
  }, [context.chatClassName]);

  const safeFormStyles = useMemo(() => {
    return sanitizeStyles(context.formStyles?.formStyles ?? {});
  }, [context.formStyles?.formStyles]);

  const safeInputStyles = useMemo(() => {
    return sanitizeStyles(context.formStyles?.inputStyles ?? {});
  }, [context.formStyles?.inputStyles]);

  const safeButtonStyles = useMemo(() => {
    return sanitizeStyles(context.formStyles?.buttonStyles ?? {});
  }, [context.formStyles?.buttonStyles]);

  return {
    safeHeaderStyles,
    safeHeaderClassName,
    safeChatClassName,
    safeChatStyles,
    safeFormStyles,
    safeInputStyles,
    safeButtonStyles,
  };
};
