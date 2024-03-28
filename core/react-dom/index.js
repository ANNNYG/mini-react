import { commitDelete, commitWork } from "./commit";
import { reconcileChildren, createDom, updateProps } from "./handleFiber";

let nextWorkOfUnit; // 下一个要处理的fiber节点
let workInProgressRoot;
let currentRoot; // current fiber节点
let deleteFibers = []; // 删除的fiber节点
let workInProgressFiber;

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
  workInProgressRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot,
  };
  nextWorkOfUnit = workInProgressRoot;
  requestIdleCallback(workLoop);
};

const workLoop = (deadline) => {
  let showYield = false;
  while (!showYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);
    showYield = !deadline.timeRemaining() < 1;
  }

  if (!nextWorkOfUnit && workInProgressRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
};

const updateFunctionComponent = (fiber) => {
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
  currentRoot = workInProgressRoot;
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

export { update, deleteFiber };
export default { createRoot, update };
