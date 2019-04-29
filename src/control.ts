import { Geometry, LineString, MultiLineString, Point } from "geojson";
import { createCollapseablePanel } from "./CollapsablePanel";
import {
  ICrossing,
  ICrossingLocation,
  IDirectionalRelatedData
} from "./interfaces";
import { createLaneVCTable } from "./LaneVCTable";
import { createTabContainer } from "./Tabs";

// Define classes
const vcRootClass = "vc-root";
const vcImageClass = "vc-image";
const vcNoImageClass = "vc-no-image";
const vcAdvisoryNoteClass = "vc-advisory-note";
const extendedDetailsTableClass = "vc-extended-details-table";
const genericDisclaimerClass = "vc-generic-disclaimer";
const vcLinkListClass = "vc-link-list";

/**
 * Creates the content pane for the data associated with a
 * crossing location for a single direction.
 * @param relatedData Related data for a crossing location for a single direction.
 */
function createDirectionPane(relatedData: IDirectionalRelatedData) {
  let advisoryNoteElement: HTMLElement | undefined;
  let imageOrPlaceholder: HTMLElement;

  if (relatedData.advisoryNote) {
    advisoryNoteElement = document.createElement("div");
    advisoryNoteElement.textContent = relatedData.advisoryNote;
    advisoryNoteElement.classList.add(vcAdvisoryNoteClass);
  }
  if (relatedData.document) {
    const image = document.createElement("img");
    image.src = relatedData.document;
    image.classList.add(vcImageClass);
    const imgLink = document.createElement("a");
    imgLink.href = relatedData.document;
    imgLink.target = "_blank";
    imgLink.rel = "noopener";
    imgLink.appendChild(image);
    imageOrPlaceholder = imgLink;
  } else {
    const placeholder = document.createElement("div");
    placeholder.classList.add(vcNoImageClass);
    imageOrPlaceholder = placeholder;
  }
  const lanesTable = createLaneVCTable(relatedData.lanes);
  const pane = document.createElement("div");
  if (advisoryNoteElement) {
    pane.appendChild(advisoryNoteElement);
  }
  pane.appendChild(imageOrPlaceholder);
  pane.appendChild(lanesTable);

  const genericDisclaimer = document.createElement("p");
  genericDisclaimer.classList.add(genericDisclaimerClass);
  genericDisclaimer.textContent =
    "These measurements shown are the clearances for each respective travel lane.  The lane numbering is referenced from left lane to right lane.  The values shown have no association with clearance over shoulders.";
  pane.appendChild(genericDisclaimer);

  return pane;
}

function createExtendedDetailsTable(crossingLocation: ICrossingLocation) {
  const extendedDetailsData: any = {
    "State Structure ID": crossingLocation.stateStructureId,
    "Bridge Number": crossingLocation.bridgeNumber,
    "Crossing Description": crossingLocation.crossingDesc,
    "State Route Location": `${crossingLocation.stateRouteIdentifier} @ MP ${
      crossingLocation.srmp
    }${crossingLocation.abInd || ""}`
  };
  const xdTable = document.createElement("table");
  xdTable.classList.add(extendedDetailsTableClass);
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
 * Gets the first set of XY coordinates.
 */
function getXY(geometry: Geometry): [number, number] {
  if (geometry.type === "Point") {
    return [geometry.coordinates[0], geometry.coordinates[1]];
  }
  if (geometry.type === "LineString" || geometry.type === "MultiPoint") {
    const pt = geometry.coordinates[0];
    return pt.slice(0, 2) as [number, number];
  }
  if (geometry.type === "MultiLineString" || geometry.type === "Polygon") {
    const pt = geometry.coordinates[0][0];
    return pt.slice(0, 2) as [number, number];
  }
  if (geometry.type === "MultiPolygon") {
    const pt = geometry.coordinates[0][0][0];
    return pt.slice(0, 2) as [number, number];
  }
  if (geometry.type === "GeometryCollection") {
    return getXY(geometry.geometries[0]);
  }
  throw new Error("unsupported type");
}

function createGoogleStreetViewLink(x: number, y: number) {
  // <a class="google-street-view" href="//maps.google.com/maps?q=&layer=c&cbll=47.84537299272301,-121.97032528754238&cbp=11,0,0,0,0" target="_blank">Google Street View</a>
  const a = document.createElement("a");
  a.href = `https://maps.google.com/maps?q=&layer=c&cbll=${y},${x}&cbp=11,0,0,0,0`;
  a.target = "_blank";
  a.rel = "noopener";
  a.textContent = "Google Street View";
  return a;
}

function createLocalAgencyContactLink() {
  const a = document.createElement("a");
  a.href = "https://www.wsdot.wa.gov/CommercialVehicle/county_permits.htm";
  a.target = "_blank";
  a.rel = "noopener";
  a.textContent = "Local agency contacts";
  return a;
}

/**
 * Create element displaying data applying to the crossing itself,
 * common to all directions.
 */
function createCommonArea(crossing: ICrossing) {
  const table = createExtendedDetailsTable(crossing.crossingLocation);

  // TODO: Create and add "Google Street View" and "Local agency Contacts" links.
  const linkList = document.createElement("ul");
  linkList.classList.add(vcLinkListClass);
  let li = document.createElement("li");
  let a = createGoogleStreetViewLink(...getXY(crossing.crossingLocation.shape));
  li.appendChild(a);
  linkList.appendChild(li);
  li = document.createElement("li");
  a = createLocalAgencyContactLink();
  li.appendChild(a);
  linkList.appendChild(li);

  const collapsePanel = createCollapseablePanel("Details...", table, false);

  const root = document.createElement("div");
  root.appendChild(linkList);
  root.appendChild(collapsePanel);
  return root;
}

/**
 * Creates an HTML element displaying information about a crossing location.
 * @param crossing Response from BridgeVC ArcGIS Server Object Extension (SOE).
 * @returns If there is data for both directions, a tab container div is returned.
 * If there is only data for a single direction, the equivalent of a tab panel is
 * returned.
 */
export function createControl(crossing: ICrossing): HTMLDivElement {
  const { increase, decrease } = crossing.relatedData;
  const root = document.createElement("div");
  const [iPane, dPane] = [increase, decrease].map(rd => {
    if (!rd) {
      return null;
    }
    return createDirectionPane(rd);
  });
  if (iPane && dPane) {
    root.appendChild(
      createTabContainer({
        "View Increasing Milepost": iPane!,
        "View Decreasing Milepost": dPane!
      })
    );
  } else if (iPane || dPane) {
    root.appendChild((iPane || dPane)!);
  }

  const common = createCommonArea(crossing);
  root.appendChild(common);
  root.classList.add(vcRootClass);

  return root;
}
