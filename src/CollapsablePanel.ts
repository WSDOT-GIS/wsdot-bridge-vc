const collapsablePanelRootClass = "collapsable-panel";
const collapsedClass = `${collapsablePanelRootClass}--collapsed`;
const expandedClass = `${collapsablePanelRootClass}--expanded`;
const toggleClass = `${collapsablePanelRootClass}__toggle`;
const contentClass = `${collapsablePanelRootClass}__content`;

export function createCollapsablePanel(
  label: string,
  content: HTMLElement,
  startExpanded = false
) {
  const root = document.createElement("div");
  root.classList.add(collapsablePanelRootClass);
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
