/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-08-26 10:13:11
 */
"use client";
import { useCallback } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const useTimestamp = () => {
  // 使用浏览器的默认时区
  const browserTimezone = dayjs.tz.guess();

  const formatTime = useCallback(
    (value, format) => {
      return dayjs.unix(value).tz(browserTimezone).format(format);
    },
    [browserTimezone]
  );

  return { formatTime };
};

