window.addEventListener("load", main);

const API_URL = "http://localhost:8080/ordbogen";
const resultDisplay = document.querySelector("#results");
let baseMin;
let baseMax;

async function main() {
  document.querySelector("#input-form").addEventListener("submit", searchClicked);
  initialFetch();
  //   const res = await getEntryAt(10000);
  //   console.log("Result at 10k:", res);
}

async function initialFetch() {
  const response = await fetch(API_URL);
  const result = await response.json();
  //   console.log("Response:", response);
  //   console.log("And the result:", result);
  baseMin = result.min;
  baseMax = result.max;

  console.log("basemin, basemax", baseMin, baseMax);
}

async function searchClicked(event) {
  //   resultDisplay.innerHTML = "";
  event.preventDefault();
  console.log(event);
  const query = event.target.input.value;
  console.log(query);
  const word = await findWord(query);
  console.log("Found word, maybe", word);
  if (word === -1) {
    resultDisplay.insertAdjacentHTML(
      "afterbegin",
      /*html*/ `
    <div class="result">Kunne ikke finde ${query}</div>
    `
    );
  } else {
    resultDisplay.insertAdjacentHTML(
      "afterbegin",
      /*html*/ `
    <div class="result">
        <h3>Headword: ${word.headword}</h3>
        <div>Homograph: ${word.homograph}</div>
        <div>Id: ${word.id}</div>
        <div>Inflected: ${word.inflected}</div>
        <div>Part of speech: ${word.partofspeech}</div>
    </div>
    `
    );
  }
}

async function findWord(query) {
  let middle;
  let localMax = baseMax;
  let localMin = baseMin;
  let iterations = 0;

  let startTime = performance.now();
  //   let totalTime = 0;

  while (localMin <= localMax) {
    iterations++;
    middle = Math.floor((localMax + localMin) / 2);
    console.log("Min, max, middle:", localMin, localMax, middle);

    const entry = await getEntryAt(middle);

    const totalTime = performance.now() - startTime;
    document.querySelector("#iterations").innerHTML = iterations;
    document.querySelector("#time").innerHTML = (totalTime / 1000).toFixed(2);

    // console.log("respoonse:", response);

    const comparison = compare(query, entry.inflected);
    console.log(comparison);
    if (comparison == 0) {
      const endTime = performance.now() - startTime;
      console.log("End time", endTime);
      return entry;
    } else if (comparison == 1) {
      localMin = middle + 1;
    } else {
      localMax = middle - 1;
    }
    if (iterations > 30) {
      console.log("breaking out");
      break;
    }
  }
  console.log(iterations + " iterations reached");

  //   console.log("End time", endTime);

  return -1;
}

function compare(value1, value2) {
  return value1.localeCompare(value2);
}

async function getEntryAt(index) {
  const entry = await fetch(`${API_URL}/${index}`).then((response) => response.json());
  return entry;
}
