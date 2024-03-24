import { TEXT_ELEMENT } from "../type/index";

const createElement = (type, props, ...children) => {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        return typeof child === "string" ? createTextNode(child) : child;
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

export { createElement, createTextNode };

export default { createElement, createTextNode };
