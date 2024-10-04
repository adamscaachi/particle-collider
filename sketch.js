//////////////////////////// Initialisation ////////////////////////////

// Camera
const angleX = -0.1;
let angleY = 0;
const rotationSpeed = 0.0025;

// Detector Parameters
let boxWidth;
let boxHeight;
let boxDepth;
let tubeRadius;
let tubeLength;
let beamRadius;
let blockHeight;
let blockWidth;
let blockDepth;
let cellSize;
let directions;
const numSegments = 20;
const genProb = 0.4;
const numPlanes = 4;
const minBlocks = 2;
const maxBlocks = 5;
const numCells = 20;
const actiProb = 0.2;

// Track Parameters
const numMuons = 15;
const curvature = 10;

// Component Arrays
let southSegments = [];
let northSegments = [];
let innerPlanes = [];
let middlePlanes = [];
let outerPlanes = [];
let blocks = [];
let muonTracks = [];
let electronTracks = [];
let hadronTracks = [];
let cells = [];
let activated = [];

// Timer
let lastReset = 0;
const duration = 5000;

// Colours
let wireframeStroke;
let detectorStroke;
let detectorFill;
let muonStroke;
let electronStroke;
let hadronStroke;

///////////////////////////////// Main /////////////////////////////////

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  ortho(-width / 2, width / 2, -height / 2, height / 2);
  initialiseColors();
  initialiseParameters();
  generateComponents();
}

function initialiseParameters() {
  if (windowWidth < windowHeight) {
    boxDepth = windowWidth * 0.8;
    boxWidth = boxDepth * 0.625;
    boxHeight = boxWidth;
  } else {
    boxHeight = windowHeight * 0.5;
    boxWidth = boxHeight;
    boxDepth = boxHeight * 1.6;
    boxWidth = boxDepth * 0.625;
  }
  tubeRadius = boxWidth * 0.5;
  tubeLength = tubeRadius * 0.9;
  beamRadius = tubeRadius * 0.08;
  blockHeight = boxWidth * 0.12;
  blockWidth = blockHeight * 0.75;
  blockDepth = blockHeight * 0.75;
  cellSize = boxWidth / numCells;
  directions = [
    { dx: cellSize, dy: 0 },
    { dx: -cellSize, dy: 0 },
    { dx: 0, dy: cellSize },
    { dx: 0, dy: -cellSize },
    { dx: cellSize, dy: cellSize },
    { dx: -cellSize, dy: cellSize },
    { dx: cellSize, dy: -cellSize },
    { dx: -cellSize, dy: -cellSize },
  ];
}

function initialiseColors() {
  wireframeStroke = color(110, 164, 244);
  detectorStroke = color(110, 164, 244);
  detectorFill = color(50, 200, 255, 30);
  muonStroke = color(255, 200, 255);
  electronStroke = color(255, 100, 255);
  hadronStroke = color(255, 0, 255);
}

function destroyComponents() {
  southSegments = [];
  northSegments = [];
  innerPlanes = [];
  middlePlanes = [];
  outerPlanes = [];
  blocks = [];
  muonTracks = [];
  electronTracks = [];
  hadronTracks = [];
  cells = [];
  activated = [];
}

function generateComponents() {
  generateSegments(
    southSegments,
    tubeRadius * 0.5,
    beamRadius,
    numSegments,
    genProb,
    -tubeLength
  );
  generateSegments(
    northSegments,
    tubeRadius * 0.5,
    beamRadius,
    numSegments,
    genProb,
    tubeLength
  );
  generatePlanes(innerPlanes, tubeRadius * 0.55, tubeLength, numPlanes);
  generatePlanes(middlePlanes, tubeRadius * 0.6, tubeLength, numPlanes);
  generatePlanes(outerPlanes, tubeRadius * 0.65, tubeLength, numPlanes);
  generateBlocks(blocks, random(minBlocks, maxBlocks));
  generateMuons(numMuons);
  generateTracks(innerPlanes, electronTracks);
  generateTracks(middlePlanes, electronTracks);
  generateTracks(outerPlanes, electronTracks);
  generateTracks(blocks, hadronTracks);
  activateNeighbours(actiProb);
}

function drawComponents() {
  drawBox(boxWidth, boxHeight, boxDepth);
  drawCylinder(tubeRadius, tubeLength);
  drawSegments(southSegments);
  drawSegments(northSegments);
  drawPlanes(innerPlanes);
  drawPlanes(middlePlanes);
  drawPlanes(outerPlanes);
  drawBlocks(blocks);
  drawTracks(muonStroke, muonTracks);
  drawTracks(electronStroke, electronTracks);
  drawTracks(hadronStroke, hadronTracks);
  drawCells(cells);
}

function resetComponents() {
  if (millis() - lastReset > duration) {
    destroyComponents();
    generateComponents();
    lastReset = millis();
  }
}

function rotateCamera() {
  angleY -= rotationSpeed;
  rotateX(angleX);
  rotateY(angleY);
}

function clearScreen() {
  background(0);
}

function draw() {
  clearScreen();
  resetComponents();
  rotateCamera();
  drawComponents();
}

////////////////////////// Draw 3D Primitives //////////////////////////

function drawBox(boxWidth, boxHeight, boxDepth) {
  stroke(wireframeStroke);
  noFill();
  box(boxWidth, boxHeight, boxDepth);
}

function drawCircle(radius, zPos) {
  push();
  stroke(wireframeStroke);
  noFill();
  translate(0, 0, zPos);
  circle(0, 0, radius);
  pop();
}

function drawLine(x1, y1, z1, x2, y2, z2) {
  stroke(wireframeStroke);
  noFill();
  line(x1, y1, z1, x2, y2, z2);
}

function drawCylinder(radius, length) {
  drawCircle(radius, length);
  drawCircle(radius, -length);
  drawLine(0, radius / 2, length, 0, radius / 2, -length);
  drawLine(0, -radius / 2, length, 0, -radius / 2, -length);
}

////////////////////////// Detector Segments ///////////////////////////

function generateSegments(
  segmentArray,
  outerRadius,
  innerRadius,
  numSegments,
  genProb,
  zPos
) {
  let step = TWO_PI / numSegments;
  for (let i = 0; i < numSegments; i++) {
    if (random() < genProb) {
      let theta1 = i * step;
      let theta2 = (i + 1) * step;
      segmentArray.push({
        v1: {
          x: cos(theta1) * outerRadius,
          y: sin(theta1) * outerRadius,
          z: zPos,
        },
        v2: {
          x: cos(theta2) * outerRadius,
          y: sin(theta2) * outerRadius,
          z: zPos,
        },
        v3: {
          x: cos(theta2) * innerRadius,
          y: sin(theta2) * innerRadius,
          z: zPos,
        },
        v4: {
          x: cos(theta1) * innerRadius,
          y: sin(theta1) * innerRadius,
          z: zPos,
        },
      });
    }
  }
}

function drawSegments(segmentArray) {
  stroke(detectorStroke);
  fill(detectorFill);
  for (let i = 0; i < segmentArray.length; i++) {
    let segment = segmentArray[i];
    beginShape();
    vertex(segment.v1.x, segment.v1.y, segment.v1.z);
    vertex(segment.v2.x, segment.v2.y, segment.v2.z);
    vertex(segment.v3.x, segment.v3.y, segment.v3.z);
    vertex(segment.v4.x, segment.v4.y, segment.v4.z);
    endShape(CLOSE);
  }
}

/////////////////////////// Detector Planes ////////////////////////////

function generatePlanes(planeArray, radius, length, numPlanes) {
  for (let i = 0; i < numPlanes; i++) {
    let angle = random(TWO_PI);
    planeArray.push({
      x: cos(angle) * radius,
      y: sin(angle) * radius,
      z: random(-length * 0.8, length * 0.8),
      w: random(boxWidth * 0.04, boxWidth * 0.06),
      h: random(boxWidth * 0.04, boxWidth * 0.1),
      angle: angle,
    });
  }
}

function drawPlanes(planeArray) {
  for (let i = 0; i < planeArray.length; i++) {
    let plane = planeArray[i];
    push();
    translate(plane.x, plane.y, plane.z);
    rotateX(HALF_PI);
    rotateY(HALF_PI + plane.angle);
    stroke(detectorStroke);
    fill(detectorFill);
    rectMode(CENTER);
    rect(0, 0, plane.w, plane.h);
    pop();
  }
}

/////////////////////////// Detector Blocks ////////////////////////////

function generateBlocks(blockArray, numBlocks) {
  for (let i = 0; i < numBlocks; i++) {
    let xMax = boxWidth * 0.5 - blockWidth * 0.75;
    let y = boxHeight * 0.5 - blockHeight * 0.75;
    let zMax = boxDepth * 0.5 - blockDepth * 0.75;
    if (i % 2 == 1) {
      y *= -1;
    }
    blockArray.push({ x: random(-xMax, xMax), y: y, z: random(-zMax, zMax) });
  }
}

function drawBlocks(blockArray) {
  for (let i = 0; i < blockArray.length; i++) {
    let block = blockArray[i];
    push();
    stroke(detectorStroke);
    fill(detectorFill);
    translate(block.x, block.y, block.z);
    box(blockWidth, blockHeight, blockDepth);
    pop();
  }
}

/////////////////////////// Particle Tracks ////////////////////////////

function generateTracks(detectorArray, trackArray) {
  for (let i = 0; i < detectorArray.length; i++) {
    let detector = detectorArray[i];
    let controlPoint = [
      detector.x * 0.5 + random([1.0, -1.0]) * curvature,
      detector.y * 0.5 + random([1.0, -1.0]) * curvature,
      detector.z * 0.5 + random([1.0, -1.0]) * curvature,
    ];
    trackArray.push({
      start: { x: 0, y: 0, z: 0 },
      control: { x: controlPoint[0], y: controlPoint[1], z: controlPoint[2] },
      end: { x: detector.x, y: detector.y, z: detector.z },
    });
  }
}

function generateMuons(numMuons) {
  for (let i = 0; i < numMuons; i++) {
    let endPoint = [
      random(-boxWidth * 0.45, boxWidth * 0.45),
      random(-boxHeight * 0.45, boxHeight * 0.45),
      random([-boxDepth * 0.5, boxDepth * 0.5]),
    ];
    generateCell(endPoint);
    let controlPoint = [
      endPoint[0] * 0.5 + random([1.0, -1.0]) * curvature,
      endPoint[1] * 0.5 + random([1.0, -1.0]) * curvature,
      endPoint[2] * 0.5 + random([1.0, -1.0]) * curvature,
    ];
    muonTracks.push({
      start: { x: 0, y: 0, z: 0 },
      control: { x: controlPoint[0], y: controlPoint[1], z: controlPoint[2] },
      end: { x: endPoint[0], y: endPoint[1], z: endPoint[2] },
    });
  }
}

function drawTracks(trackStroke, trackArray) {
  stroke(trackStroke);
  noFill();
  for (let i = 0; i < trackArray.length; i++) {
    let track = trackArray[i];
    beginShape();
    vertex(track.start.x, track.start.y, track.start.z);
    bezierVertex(
      track.control.x,
      track.control.y,
      track.control.z,
      track.control.x,
      track.control.y,
      track.control.z,
      track.end.x,
      track.end.y,
      track.end.z
    );
    endShape();
  }
}

//////////////////////////// Detector Cells ////////////////////////////

function generateCell(endPoint) {
  for (let i = 0; i < numCells; i++) {
    for (let j = 0; j < numCells; j++) {
      let x = i * cellSize - boxWidth * 0.5;
      let y = j * cellSize - boxWidth * 0.5;
      if (
        endPoint[0] >= x &&
        endPoint[0] < x + cellSize &&
        endPoint[1] >= y &&
        endPoint[1] < y + cellSize
      ) {
        cells.push({
          v1: { x: x, y: y, z: endPoint[2] },
          v2: { x: x + cellSize, y: y, z: endPoint[2] },
          v3: { x: x + cellSize, y: y + cellSize, z: endPoint[2] },
          v4: { x: x, y: y + cellSize, z: endPoint[2] },
        });
      }
    }
  }
}

function drawCells() {
  stroke(detectorStroke);
  fill(detectorFill);
  for (let i = 0; i < cells.length; i++) {
    let cell = cells[i];
    beginShape();
    vertex(cell.v1.x, cell.v1.y, cell.v1.z);
    vertex(cell.v2.x, cell.v2.y, cell.v2.z);
    vertex(cell.v3.x, cell.v3.y, cell.v3.z);
    vertex(cell.v4.x, cell.v4.y, cell.v4.z);
    endShape(CLOSE);
  }
}

function activateNeighbours(actiProb) {
  for (let i = 0; i < cells.length; i++) {
    for (let j = 0; j < directions.length; j++) {
      let cell = cells[i];
      let direction = directions[j];
      if (random() < actiProb) {
        activated.push({
          v1: {
            x: cell.v1.x + direction.dx,
            y: cell.v1.y + direction.dy,
            z: cell.v1.z,
          },
          v2: {
            x: cell.v2.x + direction.dx,
            y: cell.v2.y + direction.dy,
            z: cell.v2.z,
          },
          v3: {
            x: cell.v3.x + direction.dx,
            y: cell.v3.y + direction.dy,
            z: cell.v3.z,
          },
          v4: {
            x: cell.v4.x + direction.dx,
            y: cell.v4.y + direction.dy,
            z: cell.v4.z,
          },
        });
      }
    }
  }
  cells.push(...activated);
}