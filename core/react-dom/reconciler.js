import { TEXT_ELEMENT, UPDATE, PLACEMENT } from "../type/index";
import { deleteFiber } from "./index";

const createDom = (type) => {
  return type === TEXT_ELEMENT
    ? document.createTextNode("")
    : document.createElement(type);
};

const updateProps = (dom, nextProps, oldProps) => {
  Object.keys(oldProps).forEach((key) => {
    if (!nextProps[key] && key !== "children" && dom.removeAttribute)
      dom.removeAttribute(key);
  });

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

const reconcileChildren = (workInProgressFiber, children) => {
  let currentFiber = workInProgressFiber.alternate?.child;
  let prevChild; // 记录上一个孩子节点
  children?.forEach((child, index) => {
    // type一样为更新 不一样为创建
    const isSameType = currentFiber && currentFiber.type === child.type;
    let newFiber;

    if (isSameType) {
      newFiber = {
        type: child.type,
        props: child.props,
        child: null,
        parent: workInProgressFiber,
        sibling: null,
        dom: currentFiber.dom,
        effectTag: UPDATE,
        alternate: currentFiber,
      };
    } else {
      // type不一样的情况 需要新增一个fiber并且删除current fiber
      if (child) {
        newFiber = {
          type: child.type,
          props: child.props,
          child: null,
          parent: workInProgressFiber,
          sibling: null,
          dom: null,
          effectTag: PLACEMENT,
        };
      }
      if (currentFiber) deleteFiber(currentFiber);
    }

    if (currentFiber) currentFiber = currentFiber.sibling;

    if (index === 0 || !prevChild) {
      workInProgressFiber.child = newFiber;
    } else {
      prevChild.sibling = newFiber;
    }
    if (newFiber) {
      prevChild = newFiber;
    }
  });

  while (currentFiber) {
    deleteFiber(currentFiber);
    currentFiber = currentFiber.sibling;
  }
};

export { reconcileChildren, createDom, updateProps };
