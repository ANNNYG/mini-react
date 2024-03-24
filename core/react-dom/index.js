import { TEXT_ELEMENT } from "../type/index";

let nextWorkOfUnit;

const _render = (el, container) => {
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [el],
    },
  };

  requestIdleCallback(workLoop);
};

const createDom = (type) => {
  return type === TEXT_ELEMENT
    ? document.createTextNode("")
    : document.createElement(type);
};

const updateProps = (dom, props) => {
  Object.keys(props).forEach((key) => {
    if (key !== "children") dom[key] = props[key];
  });
};

const initChildren = (fiber) => {
  const children = fiber.props.children;
  let prevChild = null; // 记录上一个孩子节点
  children?.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      props: child.props,
      child: null,
      parent: fiber,
      sibling: null,
      dom: null,
    };

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevChild.sibling = newFiber;
    }
    prevChild = newFiber;
  });
};

const performWorkOfUnit = (fiber) => {
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type));
    fiber.parent.dom.append(dom);

    updateProps(dom, fiber.props);
  }

  // 为孩子创建fiber节点，并建立指针关系
  initChildren(fiber);

  // 通过建立的指针关系，返回下一个要执行的fiber
  if (fiber.child) return fiber.child;
  if (fiber.sibling) return fiber.sibling;
  return fiber.parent?.sibling;
};

const workLoop = (deadline) => {
  let showYield = false;
  while (!showYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);
    showYield = !deadline.timeRemaining() < 1;
  }

  requestIdleCallback(workLoop);
};

const createRoot = (container) => {
  return {
    render(el) {
      return _render(el, container);
    },
  };
};

export default { createRoot };
