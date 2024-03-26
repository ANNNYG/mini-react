import { TEXT_ELEMENT } from "../type/index";

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

const initChildren = (fiber, children) => {
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
  const isFunctionComponent = typeof fiber.type === "function";

  if (!fiber.dom && !isFunctionComponent) {
    const dom = (fiber.dom = createDom(fiber.type));
    updateProps(dom, fiber.props);
  }
  const children = isFunctionComponent
    ? [fiber.type(fiber.props)]
    : fiber.props.children;
  // 为孩子创建fiber节点，并建立指针关系
  initChildren(fiber, children);

  let nextFiber = fiber;
  // 通过建立的指针关系，返回下一个要执行的fiber
  if (fiber.child) return fiber.child;

  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent;
  }
};

export { initChildren, createDom, updateProps, performWorkOfUnit };
