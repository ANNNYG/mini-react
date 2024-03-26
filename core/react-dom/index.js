import { performWorkOfUnit } from "./handleFiber";

let nextWorkOfUnit; // 下一个要处理的fiber节点
let root; // 根节点

const _render = (el, container) => {
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [el],
    },
  };
  root = nextWorkOfUnit;
  requestIdleCallback(workLoop);
};

const workLoop = (deadline) => {
  let showYield = false;
  while (!showYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);
    showYield = !deadline.timeRemaining() < 1;
  }

  if (!nextWorkOfUnit && root) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
};

// 将创建好的dom挂载在fiber节点上
const commitRoot = () => {
  commitWork(root.child);
  root = null;
};

// 递归挂载dom
const commitWork = (fiber) => {
  if (!fiber) return;
  let parentFiber = fiber.parent;

  while (!parentFiber.dom) {
    parentFiber = parentFiber.parent;
  }

  if (fiber.dom) {
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

export default { createRoot };
