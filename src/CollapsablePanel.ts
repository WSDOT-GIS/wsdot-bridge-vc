const collapseablePanelRootClass = "collapsable-panel";
const collapsedClass = `${collapseablePanelRootClass}--collapsed`;
const expandedClass = `${collapseablePanelRootClass}--expanded`;
const toggleClass = `${collapseablePanelRootClass}__toggle`;
const contentClass = `${collapseablePanelRootClass}__content`;

export function createCollapseablePanel(
  label: string,
  content: HTMLElement,
  startExpanded: boolean = false
) {
  const root = document.createElement("div");
  root.classList.add(collapseablePanelRootClass);
  if (startExpanded) {
    root.classList.add(expandedClass);
  } else {
    root.classList.add(collapsedClass);
  }

  const toggle = document.createElement("div");
  toggle.classList.add(toggleClass);
  toggle.textContent = label;

  root.appendChild(toggle);
  content.classList.add(contentClass);
  root.appendChild(content);

  toggle.addEventListener("click", () => {
    root.classList.toggle(collapsedClass);
    root.classList.toggle(expandedClass);
  });

  return root;
}
