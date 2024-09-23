/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-09-23 11:55:42
 */
import React from "react";

export function normalizeAttrs(attrs = {}) {
  return Object.keys(attrs).reduce((acc, key) => {
    const val = attrs[key];
    key = key.replace(/([-]\w)/g, (g) => g[1].toUpperCase());
    key = key.replace(/([:]\w)/g, (g) => g[1].toUpperCase());
    switch (key) {
      case "class":
        acc.className = val;
        delete acc.class;
        break;
      case "style":
        acc.style = val.split(";").reduce((prev, next) => {
          const pairs = next?.split(":");

          if (pairs[0] && pairs[1]) {
            const k = pairs[0].replace(/([-]\w)/g, (g) => g[1].toUpperCase());
            prev[k] = pairs[1];
          }

          return prev;
        }, {});
        break;
      default:
        acc[key] = val;
    }
    return acc;
  }, {});
}

export function generate(node, key, rootProps = false) {
  if (!rootProps) {
    return React.createElement(
      node.name,
      { key, ...normalizeAttrs(node.attributes) },
      (node.children || []).map((child, index) =>
        generate(child, `${key}-${node.name}-${index}`)
      )
    );
  }

  return React.createElement(
    node.name,
    {
      key,
      ...normalizeAttrs(node.attributes),
      ...rootProps,
    },
    (node.children || []).map((child, index) =>
      generate(child, `${key}-${node.name}-${index}`)
    )
  );
}
