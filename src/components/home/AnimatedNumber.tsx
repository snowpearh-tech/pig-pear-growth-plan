import { animate, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  suffix?: string;
}

export function AnimatedNumber({
  value,
  suffix = "",
}: AnimatedNumberProps) {
  const motionValue = useMotionValue(value);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });

    return () => controls.stop();
  }, [motionValue, value]);

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}
