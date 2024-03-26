# 手写 mini-react

## 虚拟 DOM

在 jsx 中，Html 标签会被编译成成 `createElement`,createElement 会创建对应的虚拟 dom，举个例子

```jsx
import React from "react";

<div id="div">this a div</div>;
// 会被编译成以下代码

React.createElement("div", {
  id: "div",
  children: [{ type: "TEXT_ELEMENT", props: { nodeValue: "this a div" } }],
});
```

### 使用虚拟 DOM 的原因

虚拟 dom 可以通过一个对象来描述真实 dom
1、对真实 dom 进行增删改的操作时候，可能会引起页面的回流以及重绘，这对于浏览器性能是一个很大的损耗，我们可以使用虚拟 dom，先对虚拟 dom 进行增删改的操作，因为虚拟 dom 不存在于视图而存在于内存之中，并不存在会引起浏览器回流以及重绘的问题。
2、真实 dom 是远远比虚拟 dom 重的，而真实 dom 上的属性其实有相当大的一部分是我们平常使用不到的，那我们去操纵一个比较轻的对象（虚拟 dom）会不会没那么损耗性能

## 挂载真实 dom

我们通过虚拟 dom 可以创建出对应的真实 dom，挂载到页面上，react 早期版本是将创建好的真实 dom 一次性地挂载到页面上，这将带来一个问题，当我们的虚拟 dom 很多，创建真实 dom 将会是个很耗时间的过程，比如创建真实 dom 的时间花费了一秒钟，那我们会感知到肉眼可见的卡顿（实际肉眼可感知到的卡顿远远小于一秒），所以在 react 后续版本使用了可中断的更新，是结合浏览器事件循环机制来做的
这边实现了个简易版，react 的实现将为更负责，他的调度器实现了优先级的制度，简易版实现如下

```js
const workLoop = (deadline) => {
  let showYield = false; // 是否应该中断
  // nextWorkOfUnit为我们的虚拟dom
  // 当没有虚拟dom的时候我们应该中断
  while (!showYield && nextWorkOfUnit) {
    // 处理element并生成fiber节点，并返回子节点的fiber节点
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);
    // 如果
    showYield = !deadline.timeRemaining() < 1;
  }

  // 当fiber节点处理完，此时fiber节点上已经有对应的真实Dom，将其一次性挂载到页面上
  if (!nextWorkOfUnit && root) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
};
```

## 处理 fiber 节点

### performWorkOfUnit

performWorkOfUnit 做的事情是将处理好的 fiber 节点返回，处理好的 fiber 节点上有 child、parent、sibling 属性，分别对应子、父、兄，通过这三个属性可以形成一个链表

```js
const performWorkOfUnit = (fiber) => {
  const isFunctionComponent = typeof fiber.type === "function";

  // 判断是函数组件还是普通的html标签，分别进入不同的逻辑
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

// 函数组件fiber处理
const updateFunctionComponent = (fiber) => {
  // 函数组件是不会创建对应的标签的，所以我们实际要处理的fiber是函数组件里面的html标签
  const children = [fiber.type(fiber.props)];
  // 处理孩子的fiber节点，形成链表
  initChildren(fiber, children);
};

const updateHostComponent = (fiber) => {
  // 首次进来是根标签，已有真实dom，不需要创建
  if (!fiber.dom) {
    // 根据fiber的type创建标签
    const dom = (fiber.dom = createDom(fiber.type));
    // 更新dom的属性
    updateProps(dom, fiber.props);
  }
  // 处理孩子的fiber节点，形成链表
  const children = fiber.props.children;
  initChildren(fiber, children);
};
```

### initChildren

在 initChildren 中，创建好子 fiber 节点，并与父 fiber 节点形成关系

```js
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
```

至此，所有 dom 都有一个对应的 fiber 节点并形成了一个树状结构（可能链表更恰当），且每个 fiber 上都有对应的真实 dom，所以下一步处理的就是将 fiber 上的真实 dom 挂载到页面上

## fiber 节点的真实 dom 挂载

其实就是一个递归调用，将 fiber 上的真实 dom 一一挂载上 fiber 的父 fiber 节点上的真实 dom 上

```js
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
```
