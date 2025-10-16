"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "../ui/badge";

const TimeSinceStarted = ({ startTime }: { startTime: Date }) => {
  const [timeSinceStarted, setTimeSinceStarted] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSinceStarted(Date.now() - startTime.getTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
      return `${days} days ${hours}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    } else {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
  };

  const formattedTime = formatTime(timeSinceStarted);
  const timeParts = formattedTime.split(":");
  const hours = timeParts[0];
  const minutes = timeParts[1];
  const seconds = timeParts[2];

  return (
    <Badge variant="outline" className="text-[0.69rem] h-5 bg-accent gap-0">
      <motion.span
        key={`hours-${hours}`} // Triggers animation when hours change
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 0.44, ease: "easeInOut" }}
      >
        {hours}:
      </motion.span>
      <motion.span
        key={`minutes-${minutes}`} // Triggers animation when minutes change
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 0.44, ease: "easeInOut" }}
      >
        {minutes}:
      </motion.span>
      <motion.span
        key={`seconds-${seconds}`} // Triggers animation when seconds change
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 0.44, ease: "easeInOut" }}
      >
        {seconds}
      </motion.span>
    </Badge>
  );
};

export default TimeSinceStarted;
