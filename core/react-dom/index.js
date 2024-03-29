import { commitDelete, commitWork } from "./commit";
import { reconcileChildren, createDom, updateProps } from "./reconciler";

let nextWorkOfUnit; // 下一个要处理的fiber节点
let workInProgressRoot;
let deleteFibers = []; // 删除的fiber节点
let workInProgressFiber;
let stateHooks;
let stateHookIndex;

const _render = (el, container) => {
  workInProgressRoot = {
    dom: container,
    props: {
      children: [el],
    },
  };
  nextWorkOfUnit = workInProgressRoot;
  requestIdleCallback(workLoop);
};

const update = () => {
  let current = workInProgressFiber;
  return () => {
    workInProgressRoot = {
      ...current,
      alternate: current,
    };
    nextWorkOfUnit = workInProgressRoot;
  };
};

const workLoop = (deadline) => {
  let showYield = false;
  while (!showYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);

    if (workInProgressRoot?.sibling?.type === nextWorkOfUnit?.type) {
      nextWorkOfUnit = undefined;
    }
    showYield = !deadline.timeRemaining() < 1;
  }

  if (!nextWorkOfUnit && workInProgressRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
};

const updateFunctionComponent = (fiber) => {
  stateHooks = [];
  stateHookIndex = 0;
  workInProgressFiber = fiber;
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

// 将创建好的dom挂载在fiber节点上
const commitRoot = () => {
  deleteFibers.forEach(commitDelete);
  commitWork(workInProgressRoot.child);
  workInProgressRoot = null;
  deleteFibers = [];
};

const deleteFiber = (fiber) => {
  if (fiber) deleteFibers.push(fiber);
};

const createRoot = (container) => {
  return {
    render(el) {
      return _render(el, container);
    },
  };
};

const useState = (initial) => {
  let current = workInProgressFiber;
  const oldStateHook = current.alternate?.stateHooks[stateHookIndex];
  const stateHook = {
    state: oldStateHook ? oldStateHook.state : initial,
  };
  stateHookIndex++;
  stateHooks.push(stateHook);

  current.stateHooks = stateHooks;

  const setState = (action) => {
    const isFunction = typeof action === "function";
    const newState = isFunction ? action(stateHook.state) : action;
    if (newState === stateHook.state) return;

    stateHook.state = newState;

    workInProgressRoot = {
      ...current,
      alternate: current,
    };

    nextWorkOfUnit = workInProgressRoot;
  };

  return [stateHook.state, setState];
};

export { update, deleteFiber, useState };
export default { createRoot, update };
