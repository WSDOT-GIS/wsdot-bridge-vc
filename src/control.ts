import {
  ICrossing,
  ICrossingLocation,
  IDirectionalRelatedData
} from "./interfaces";
import { createLaneVCTable } from "./LaneVCTable";
import { createTabContainer } from "./Tabs";

// Define classes
const vcImageClass = "vc-image";
const vcNoImageClass = "vc-no-image";
const vcAdvisoryNoteClass = "vc-advisory-note";
const extendedDetailsTableClass = "vc-extended-details-table";
const genericDisclaimerClass = "vc-generic-disclaimer";

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

function createExtendedDetailsTable(crossingLocation: ICrossingLocation) {
  const extendedDetailsData: any = {
    "State Structure ID": crossingLocation.StateStructureId,
    "Bridge Number": crossingLocation.BridgeNumber,
    "Crossing Description": crossingLocation.CrossingDesc,
    "State Route Location": `${crossingLocation.StateRouteIdentifier} @ MP ${
      crossingLocation.SRMP
    }${crossingLocation.ABInd || ""}`
  };
  const xdTable = document.createElement("table");
  for (const key in extendedDetailsData) {
    if (extendedDetailsData.hasOwnProperty(key)) {
      const value = extendedDetailsData[key];
      const row = xdTable.insertRow();
      const th = document.createElement("th");
      th.textContent = key;
      row.appendChild(th);
      const cell = row.insertCell();
      cell.textContent = `${value}`;
    }
  }
  return xdTable;
}

/**
 * Create element displaying data applying to the crossing itself,
 * common to all directions.
 */
export function createCommonArea(crossing: ICrossing) {
  const table = createExtendedDetailsTable(crossing.CrossingLocation);
}
