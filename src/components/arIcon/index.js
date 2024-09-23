/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-09-23 11:55:26
 */
import React, { forwardRef, useMemo } from "react";
import IconBase from "./IconBase";

// 动态导入所有 JSON 数据
const context = require.context("./data", false, /\.json$/);
const icons = context.keys().reduce((acc, key) => {
  const iconName = key.replace("./", "").replace(".json", "");
  acc[iconName] = context(key);
  return acc;
}, {});

const ArIcon = forwardRef(({ name, ...props }, ref) => {
  const data = useMemo(() => icons[name], [name]);

  if (!data) {
    console.error(`Icon "${name}" not found`);
    return null;
  }

  return <IconBase {...props} ref={ref} data={data} />;
});

export default ArIcon;
