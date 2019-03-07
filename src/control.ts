import { toFeetAndInches } from "./conversion";
import { ICrossing, IDirectionalRelatedData } from "./interfaces";

// Define classes
const vcInchesSpanClass = "vc-inches-span";
const vcFeetSpanClass = "vc-feet-span";
const vcDataClass = "vc-data";
const vcImageClass = "vc-image";
const vcNoImageClass = "vc-no-image";
const vcAdvisoryNoteClass = "vc-advisory-note";
const tabContainerClass = "tab-container";
const tabListClass = `${tabContainerClass}__tab-list`;
const tabContentClass = `${tabContainerClass}__content`;
const tabClass = `${tabContainerClass}__tab`;
const tabSelectedClass = `${tabClass}--selected`;
const tabContentSelectedClass = `${tabContentClass}--selected`;
const laneTableClass = "lane-table";
const laneTableCellClass = `${laneTableClass}__cell`;
const genericDisclaimerClass = "vc-generic-disclaimer";

/**
 * Creates a tab container that allows user to toggle visibility
 * of HTML elements by clicking tabs, with only one tab's content
 * visible at a time.
 * @param contents An object with HTML element properties.
 * The property names will become the tab labels.
 */
function createTabContainer(contents: { [label: string]: HTMLElement }) {
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

/**
 * Creates an HTML data element containing two spans:
 * one for inches (.vc-inches-span) and one for feet
 * (.vc-feet-span). Feet and inches labels can be
 * applied using CSS :after pseudo-selector.
 * @param heightInInches height in inches
 */
function createVCDataElement(heightInInches: number) {
  const dataElement = document.createElement("data");
  dataElement.value = heightInInches.toString(10);
  dataElement.classList.add(vcDataClass);

  const ftSpan = document.createElement("span");
  ftSpan.classList.add(vcFeetSpanClass);

  const inSpan = document.createElement("span");
  inSpan.classList.add(vcInchesSpanClass);

  const [feet, inches] = toFeetAndInches(heightInInches);
  ftSpan.textContent = feet.toString(10);
  inSpan.textContent = inches.toString(10);
  dataElement.appendChild(ftSpan);
  dataElement.appendChild(inSpan);
  return dataElement;
}

/**
 * Given an array of integers representing lane minimum
 * vertical clearance in inches, creates a table
 * displaying these values.
 * Headers will be "Lane" followed by array index + 1.
 * (E.g., item zero in array will be labeled as "Lane 1")
 * @param laneVCs An array of lane vertical clearance integers.
 */
function createLaneVCTable(laneVCs: number[]) {
  const table = document.createElement("table");
  table.classList.add(laneTableClass);
  const thead = table.createTHead();
  const tbody = table.createTBody();
  const headRow = thead.insertRow();
  const bodyRow = tbody.insertRow();

  laneVCs.map(createVCDataElement).forEach((data, i) => {
    const th = document.createElement("th");
    th.textContent = `Lane ${i + 1}`;
    headRow.appendChild(th);
    const cell = bodyRow.insertCell();
    cell.classList.add(laneTableCellClass);
    cell.appendChild(data);
  });

  return table;
}

/**
 * This function, when added as an image element's "click" event listener,
 * will open the image in a new window when the user clicks on the image element.
 * @param this img element that the user clicked on.
 * @param ev event (unused by this function)
 */
function openImageInNewTab(this: HTMLImageElement, ev: MouseEvent) {
  open(this.src);
}

/**
 * Creates the content pane for the data associated with a
 * crossing location for a single direction.
 * @param relatedData Related data for a crossing location for a single direction.
 */
function createDirectionPane(relatedData: IDirectionalRelatedData) {
  let advisoryNoteElement: HTMLElement | undefined;
  let imageOrPlaceholder: HTMLElement;

  if (relatedData.AdvisoryNote) {
    advisoryNoteElement = document.createElement("div");
    advisoryNoteElement.textContent = relatedData.AdvisoryNote;
    advisoryNoteElement.classList.add(vcAdvisoryNoteClass);
  }
  if (relatedData.Document) {
    const image = document.createElement("img");
    image.src = relatedData.Document;
    image.classList.add(vcImageClass);
    imageOrPlaceholder = image;
    image.addEventListener("click", openImageInNewTab);
  } else {
    const placeholder = document.createElement("div");
    placeholder.classList.add(vcNoImageClass);
    imageOrPlaceholder = placeholder;
  }
  const lanesTable = createLaneVCTable(relatedData.Lanes);
  const pane = document.createElement("div");
  if (advisoryNoteElement) {
    pane.appendChild(advisoryNoteElement);
  }
  pane.appendChild(imageOrPlaceholder);
  pane.appendChild(lanesTable);

  if (!advisoryNoteElement) {
    const genericDisclaimer = document.createElement("p");
    genericDisclaimer.classList.add(genericDisclaimerClass);
    genericDisclaimer.textContent =
      "Use the lowest vertical clearance measurements displayed by lane.";
    pane.appendChild(genericDisclaimer);
  }

  return pane;
}

/**
 * Creates an HTML element displaying information about a crossing location.
 * @param crossing Response from BridgeVC ArcGIS Server Object Extension (SOE).
 * @returns If there is data for both directions, a tab container div is returned.
 * If there is only data for a single direction, the equivalent of a tab panel is
 * returned.
 */
export function createControl(crossing: ICrossing): HTMLDivElement {
  const { Increase, Decrease } = crossing.RelatedData;
  const [iPane, dPane] = [Increase, Decrease].map(rd => {
    if (!rd) {
      return null;
    }
    return createDirectionPane(rd);
  });
  if (iPane && dPane) {
    return createTabContainer({
      "View Increasing Milepost": iPane!,
      "View Decreasing Milepost": dPane!
    });
  } else {
    return (iPane || dPane)!;
  }
}
