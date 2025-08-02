import { useEffect, useState } from "react";

const useAnimateChatInterface = ({ isOpen }: { isOpen: boolean }) => {
  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      // Esperamos un tick para que Tailwind aplique la animación
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
      // Espera a que termine la animación de salida para desmontar
      setTimeout(() => setRendered(false), 300);
    }
  }, [isOpen]);

  return { visible, rendered };
};

export default useAnimateChatInterface;
