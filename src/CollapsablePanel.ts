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

  const toggle = document.createElement("p");
  toggle.classList.add(toggleClass);
  const toggleLink = document.createElement("a");
  toggleLink.href = "#";
  toggle.appendChild(toggleLink);
  toggleLink.textContent = label;

  root.appendChild(toggle);
  content.classList.add(contentClass);
  root.appendChild(content);

  toggleLink.addEventListener("click", e => {
    root.classList.toggle(collapsedClass);
    root.classList.toggle(expandedClass);
    e.preventDefault();
  });

  return root;
}
