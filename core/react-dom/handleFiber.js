import { TEXT_ELEMENT, UPDATE, PLACEMENT } from "../type/index";

const createDom = (type) => {
  return type === TEXT_ELEMENT
    ? document.createTextNode("")
    : document.createElement(type);
};

const updateProps = (dom, nextProps, oldProps) => {
  Object.keys(oldProps).forEach((key) => {
    if (!nextProps[key] && key !== "children") dom.removeAttribute(key);
  });

  // 2、老得有，新的有，要更新
  // 3、老得无，新的有，要新增
  Object.keys(nextProps).forEach((key) => {
    if (nextProps[key] === oldProps[key]) return;
    if (key.startsWith("on")) {
      const eventType = key.slice(2).toLocaleLowerCase();
      dom.removeEventListener(eventType, oldProps[key]);
      dom.addEventListener(eventType, nextProps[key]);
    }
    if (key !== "children") dom[key] = nextProps[key];
  });
};

const reconcileChildren = (fiber, children) => {
  let oldFiber = fiber.alternate?.child;
  let prevChild = null; // 记录上一个孩子节点
  children?.forEach((child, index) => {
    // type一样为更新 不一样为创建
    const isSameType = oldFiber && oldFiber.type === child.type;
    let newFiber;

    if (isSameType) {
      newFiber = {
        type: child.type,
        props: child.props,
        child: null,
        parent: fiber,
        sibling: null,
        dom: oldFiber.dom,
        effectTag: UPDATE,
        alternate: oldFiber,
      };
    } else {
      newFiber = {
        type: child.type,
        props: child.props,
        child: null,
        parent: fiber,
        sibling: null,
        dom: null,
        effectTag: PLACEMENT,
      };
    }

    if (oldFiber) oldFiber = oldFiber.sibling;

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevChild.sibling = newFiber;
    }

    prevChild = newFiber;
  });
};

const updateFunctionComponent = (fiber) => {
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
};

const updateHostComponent = (fiber) => {
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type));
    updateProps(dom, fiber.props, []);
  }
  const children = fiber.props.children;
  reconcileChildren(fiber, children);
};

const performWorkOfUnit = (fiber) => {
  const isFunctionComponent = typeof fiber.type === "function";

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }
  let nextFiber = fiber;
  // 通过建立的指针关系，返回下一个要执行的fiber
  if (fiber.child) return fiber.child;

  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent;
  }
};

export { reconcileChildren, createDom, updateProps, performWorkOfUnit };
