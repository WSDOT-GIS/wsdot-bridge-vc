import { toFeetAndInches } from "./conversion";
import { ICrossing, IDirectionalRelatedData } from "./interfaces";

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

function createTabContainer(contents: { [label: string]: HTMLElement }) {
  const root = document.createElement("div");
  root.classList.add(tabContainerClass);

  const tabList = document.createElement("ul");
  tabList.classList.add(tabListClass);

  root.appendChild(tabList);

  let firstChildFound = false;

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

  for (const label in contents) {
    if (contents.hasOwnProperty(label)) {
      const element = contents[label];
      const tab = document.createElement("li");
      tab.classList.add(tabClass);
      tab.textContent = label;
      tab.addEventListener("click", selectTab);
      tabList.appendChild(tab);

      element.dataset.tabLabel = label;
      element.classList.add(tabContentClass);
      root.appendChild(element);

      if (!firstChildFound) {
        // Select the first child
        tab.classList.add(tabSelectedClass);
        element.classList.add(tabContentSelectedClass);
        firstChildFound = true;
      }
    }
  }

  // TODO: Add user interaction. Tabs will toggle associated panes.
  // const shadowRoot = root.attachShadow({ mode: "open" });

  return root;
}

/**
 * Creates an HTML data element containing two spans:
 * one for inches and one for feet.
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

function openImageInNewTab(this: HTMLImageElement, ev: MouseEvent) {
  open(this.src);
}

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
