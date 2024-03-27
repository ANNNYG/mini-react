import { TEXT_ELEMENT } from "../type/index";
import { update } from "../react-dom";

const createElement = (type, props, ...children) => {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        const isString = typeof child === "string" || typeof child === "number";
        return isString ? createTextNode(child) : child;
      }),
    },
  };
};

const createTextNode = (text) => {
  return {
    type: TEXT_ELEMENT,
    props: {
      nodeValue: text,
    },
  };
};

export { createElement, createTextNode, update };

export default { createElement, createTextNode };
