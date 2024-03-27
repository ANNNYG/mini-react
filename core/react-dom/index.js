import { performWorkOfUnit, updateProps } from "./handleFiber";
import { PLACEMENT, UPDATE } from "../type";

let nextWorkOfUnit; // 下一个要处理的fiber节点
let workInProgressRoot;
let currentRoot;

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

// 将创建好的dom挂载在fiber节点上
const commitRoot = () => {
  commitWork(workInProgressRoot.child);
  currentRoot = workInProgressRoot;
  workInProgressRoot = null;
};

// 递归挂载dom
const commitWork = (fiber) => {
  if (!fiber) return;
  let parentFiber = fiber.parent;

  while (!parentFiber.dom) {
    parentFiber = parentFiber.parent;
  }

  if (fiber.effectTag === UPDATE) {
    updateProps(fiber.dom, fiber.props, fiber.alternate?.props);
  } else if (fiber.effectTag === PLACEMENT && fiber.dom) {
    parentFiber.dom.append(fiber.dom);
  }

  commitWork(fiber.sibling);
  commitWork(fiber.child);
};

const createRoot = (container) => {
  return {
    render(el) {
      return _render(el, container);
    },
  };
};

export { update };
export default { createRoot, update };
