import { toFeetAndInches } from "./conversion";

const vcInchesSpanClass = "vc-inches-span";
const vcFeetSpanClass = "vc-feet-span";
const vcDataClass = "vc-data";
const laneTableClass = "lane-table";
const laneTableCellClass = `${laneTableClass}__cell`;

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
export function createLaneVCTable(laneVCs: number[]) {
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
