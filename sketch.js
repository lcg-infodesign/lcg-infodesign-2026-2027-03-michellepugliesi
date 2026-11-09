let table;
let nobelData = [];

// Mappa delle categorie con i rispettivi colori
const categoryMapping = {
  "physics": { label: "Fisica", color: "#4CC9F0" },
  "chemistry": { label: "Chimica", color: "#4361EE" },
  "physiology or medicine": { label: "Fisiologia o Medicina", color: "#7209B7" },
  "literature": { label: "Letteratura", color: "#F72585" },
  "peace": { label: "Pace", color: "#FFB703" },
  "economic sciences": { label: "Scienze Economiche", color: "#FB8500" }
};

let hoveredGlyph = null;
let loadError = false;

function preload() {
  table = loadTable("nobel.csv", "csv", "header", 
    () => {}, 
    (err) => { loadError = true; }
  );
}

function setup() {
  createCanvas(1350, 1120);
  textFont('Helvetica');
}

function draw() {
  background(18, 20, 28);
  
  drawHeader();
  drawLegend();
  drawFooterLink();

  if (loadError) {
    fill(255, 100, 100);
    textSize(14);
    textAlign(CENTER, CENTER);
    text("Errore: Impossile trovare 'nobel.csv'.", width / 2, height / 2);
    return;
  }

  if (!table || table.getRowCount() === 0) {
    fill(255);
    textSize(14);
    textAlign(CENTER, CENTER);
    text("Caricamento dataset in corso...", width / 2, height / 2);
    return;
  }

  if (nobelData.length === 0 && table.getRowCount() > 0) {
    for (let r = 0; r < table.getRowCount(); r++) {
      let row = table.getRow(r);
      let cat = row.getString("category");
      if (!cat) continue;
      
      nobelData.push({
        year: row.getNum("awardYear"),
        name: row.getString("fullName") || row.getString("name") || "Sconosciuto",
        category: cat.toLowerCase().trim(),
        country: row.getString("birth_countryNow") || "N/D"
      });
    }
  }

  let categories = Object.keys(categoryMapping);
  let startY = 165;
  let blockHeight = 150;
  
  hoveredGlyph = null;

  for (let c = 0; c < categories.length; c++) {
    let catKey = categories[c];
    let catInfo = categoryMapping[catKey];
    
    // dal meno recente al più recente
    let catItems = nobelData
      .filter(d => d.category === catKey)
      .sort((a, b) => a.year - b.year);
    
    // Titolo categoria
    push();
    fill(255);
    textSize(13);
    textStyle(BOLD);
    textAlign(LEFT, TOP);
    text(catInfo.label.toUpperCase() + " — Premi vinti: " + catItems.length, 50, startY);
    pop();

    let gridX = 62; 
    let gridY = startY + 32; 
    let spacingX = 40;
    let spacingY = 40;
    let maxCols = 30;

    for (let i = 0; i < catItems.length; i++) {
      let item = catItems[i];
      let col = i % maxCols;
      let row = Math.floor(i / maxCols);
      
      let x = gridX + col * spacingX;
      let y = gridY + row * spacingY;
      
      let isHovered = dist(mouseX, mouseY, x, y) < 15;
      if (isHovered) {
        hoveredGlyph = { data: item, x: x, y: y, color: catInfo.color };
      }
      
      drawMiniMedal(x, y, item, catInfo.color, isHovered);
    }

    // Linea divisoria tra i blocchi
    stroke(40, 45, 60);
    strokeWeight(1);
    line(50, startY + blockHeight - 15, width - 50, startY + blockHeight - 15);

    startY += blockHeight;
  }

  if (hoveredGlyph) {
    drawTooltip(hoveredGlyph.x, hoveredGlyph.y, hoveredGlyph.data, hoveredGlyph.color);
  }
}

function drawMiniMedal(x, y, data, baseColorHex, isHovered) {
  push();
  translate(x, y);

  let baseColor = color(baseColorHex);

  fill(255, 215, 0);
  stroke(isHovered ? 255 : baseColor);
  strokeWeight(isHovered ? 2 : 1);
  ellipse(0, 0, 24, 24);

  fill(30);
  noStroke();
  textSize(8);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  let yr = String(data.year);
  text("'" + (yr.length >= 2 ? yr.slice(-2) : yr), 0, 0);

  pop();
}

function drawHeader() {
  push();
  fill(255);
  textSize(22);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text("I PREMI NOBEL NEGLI ULTIMI 20 ANNI", 50, 20);

  fill(160, 170, 190);
  textSize(12);
  textStyle(NORMAL);
  text("Visualizzazione d'insieme della distribuzione dei Premi Nobel per categoria. Passa il mouse per i dettagli.", 50, 48);
  
  stroke(50, 60, 80);
  strokeWeight(1);
  line(50, 72, width - 50, 72);
  pop();
}

function drawLegend() {
  push();
  translate(50, 85);
  
  noStroke();
  fill(220);
  textSize(11);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text("CATEGORIE:", 0, 16);
  
  let categories = Object.keys(categoryMapping);
  let offsetX = 95;
  
  for (let catKey of categories) {
    let catInfo = categoryMapping[catKey];
    fill(catInfo.color);
    ellipse(offsetX, 16, 10, 10);
    
    fill(190);
    textStyle(NORMAL);
    text(catInfo.label.toUpperCase(), offsetX + 14, 16);
    offsetX += textWidth(catInfo.label.toUpperCase()) + 25;
  }

  pop();
}

function drawFooterLink() {
  push();
  fill(130, 140, 160);
  textSize(11);
  textStyle(NORMAL);
  textAlign(LEFT, BOTTOM);
  text("Dataset: Nobel Foundation API / nobel.csv (nobel.csv)", 50, height - 15);
  pop();
}

function drawTooltip(x, y, data, catColor) {
  push();
  let ttWidth = 210;
  let ttHeight = 70;
  let ttX = constrain(x + 15, 20, width - ttWidth - 20);
  let ttY = constrain(y - 45, 20, height - ttHeight - 20);

  fill(28, 33, 48, 245);
  stroke(catColor);
  strokeWeight(1.5);
  rect(ttX, ttY, ttWidth, ttHeight, 8);

  noStroke();
  fill(255);
  textSize(12);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  let displayName = data.name.length > 25 ? data.name.substring(0, 23) + "..." : data.name;
  text(displayName, ttX + 12, ttY + 10);

  fill(catColor);
  textSize(10);
  textStyle(BOLD);
  let catLabel = categoryMapping[data.category] ? categoryMapping[data.category].label.toUpperCase() : data.category.toUpperCase();
  text(catLabel + " (" + data.year + ")", ttX + 12, ttY + 28);

  fill(190);
  textStyle(NORMAL);
  textSize(10);
  text("Paese: " + data.country, ttX + 12, ttY + 46);

  pop();
}
