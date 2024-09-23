/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-09-23 11:55:36
 */
import React, { forwardRef } from "react";
import { generate } from "./utils";

const IconBase = forwardRef((props, ref) => {
  const { data, className, onClick, style, ...restProps } = props;

  return generate(data.icon, `svg-${data.name}`, {
    className,
    onClick,
    style,
    "data-icon": data.name,
    "aria-hidden": "true",
    ...restProps,
    ref,
  });
});

export default IconBase;
