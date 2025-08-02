import { useEffect, useRef } from "react";

const usePortalRef = () => {
  const portalRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    portalRef.current = document.getElementById("portal") as HTMLElement | null;
    if (!portalRef.current) {
      const div = document.createElement("div");
      div.setAttribute("id", "portal");
      document.body.appendChild(div);
      portalRef.current = document.getElementById("portal") as HTMLElement;
    }
  }, []);

  return portalRef.current;
};

export default usePortalRef;
