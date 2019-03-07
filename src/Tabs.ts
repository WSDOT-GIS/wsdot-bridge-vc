const tabContainerClass = "tab-container";
const tabListClass = `${tabContainerClass}__tab-list`;
const tabContentClass = `${tabContainerClass}__content`;
const tabClass = `${tabContainerClass}__tab`;
const tabSelectedClass = `${tabClass}--selected`;
const tabContentSelectedClass = `${tabContentClass}--selected`;

/**
 * Creates a tab container that allows user to toggle visibility
 * of HTML elements by clicking tabs, with only one tab's content
 * visible at a time.
 * @param contents An object with HTML element properties.
 * The property names will become the tab labels.
 */
export function createTabContainer(contents: { [label: string]: HTMLElement }) {
  // Create the root element that will be returned from the function.
  const root = document.createElement("div");
  root.classList.add(tabContainerClass);

  // Create the list that will contain the "tab" list items.
  const tabList = document.createElement("ul");
  tabList.classList.add(tabListClass);
  root.appendChild(tabList);

  // This is a flag to check if the selected classes have already been applied
  // to first tab / content pane elements.
  let firstChildFound = false;

  /**
   * This function is called when one of the tab li elements is clicked.
   * Sets the classes of the content pane elements so that only the pane
   * associated with the clicked tab is visible.
   * @param this HTML list item (li) element that was clicked.
   * @param ev Mouse click event.
   */
  function selectTab(this: HTMLLIElement, ev: MouseEvent) {
    // Change the tab selection.
    tabList.querySelectorAll("li").forEach(li => {
      li.classList.remove(tabSelectedClass);
    });
    this.classList.add(tabSelectedClass);

    const label = this.textContent;
    // Remove selected class from content panes.
    root
      .querySelectorAll(`.${tabContentSelectedClass}`)
      .forEach(c => c.classList.remove(tabContentSelectedClass));
    // Add selected class to pane corresponding to tab
    const pane = root.querySelector(`[data-tab-label='${label}']`);
    if (pane) {
      pane.classList.add(tabContentSelectedClass);
    }
  }

  // Loop through the input object and create
  // corresponding tabs and content panes.
  for (const label in contents) {
    if (contents.hasOwnProperty(label)) {
      // This element will be the content pane.
      const element = contents[label];
      // Create the tab.
      const tab = document.createElement("li");
      tab.classList.add(tabClass);
      tab.textContent = label;
      tab.addEventListener("click", selectTab);
      tabList.appendChild(tab);
      // Add a data-tab-label attribute to the tab pane
      // To associate it with the corresponding tab.
      element.dataset.tabLabel = label;
      element.classList.add(tabContentClass);
      root.appendChild(element);

      if (!firstChildFound) {
        // Select the first child
        tab.classList.add(tabSelectedClass);
        element.classList.add(tabContentSelectedClass);
        // Set the flag so we know the first item has already been found.
        firstChildFound = true;
      }
    }
  }

  return root;
}
