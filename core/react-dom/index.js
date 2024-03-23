import { TEXT_ELEMENT } from "../type/index";

const _render = (el, container) => {
  const dom =
    el.type === TEXT_ELEMENT
      ? document.createTextNode("")
      : document.createElement(el.type);
  Object.keys(el.props).forEach((key) => {
    if (key !== "children") dom[key] = el.props[key];
  });

  console.log(el);

  el.props.children?.forEach((child) => {
    _render(child, dom);
  });

  container.appendChild(dom);
};

const createRoot = (container) => {
  return {
    render(el) {
      console.log(el);
      return _render(el, container);
    },
  };
};

export default { createRoot };
