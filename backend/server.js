const http = require("http"); // Uvozimo ugradjeni Node modul http koji omogućava kreiranje web servera
const fs = require("fs"); // Uvozimo modul za rad sa fajlovima (čitanje i pisanje JSON-a)

const DATA_FILE = "./tasks.json"; // Definišemo putanju do fajla u kojem čuvamo zadatke

// Funkcija koja čita zadatke iz JSON fajla
function readTasks() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")); // Čitamo fajl i pretvaramo JSON u JS objekat
}

// Funkcija koja upisuje zadatke u JSON fajl
function writeTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2)); // Pretvaramo JS objekat u JSON i zapisujemo u fajl
}

// Kreiranje HTTP servera
const server = http.createServer((req, res) => {

  // --- CORS zaglavlja ---
  // Omogućavamo frontend-u da pristupi backend-u sa drugog porta
  res.setHeader("Access-Control-Allow-Origin", "*"); 
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Ako je OPTIONS zahtjev, odmah vraćamo 200
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // --- READ (GET) ---
  if (req.method === "GET" && req.url === "/tasks") {
    const tasks = readTasks(); // Učitavamo sve zadatke
    res.setHeader("Content-Type", "application/json"); // Specifikujemo da šaljemo JSON
    res.end(JSON.stringify(tasks)); // Šaljemo zadatke klijentu
    
  }
  // UPDATE – PUT /tasks/:id
else if (req.method === "PUT" && req.url.startsWith("/tasks/")) {
  const id = parseInt(req.url.split("/")[2]);
  let body = "";

  req.on("data", chunk => body += chunk);

  req.on("end", () => {
    let tasks = readTasks();
    const updated = JSON.parse(body);

    // Zamjena zadatka sa istim ID-jem novim podacima
    tasks = tasks.map(t => t.id === id ? { ...t, ...updated } : t);
    writeTasks(tasks);

    res.end(JSON.stringify({ message: "Task izmijenjen" }));
  });
}


  // --- CREATE (POST) ---
  else if (req.method === "POST" && req.url === "/tasks") {
    let body = ""; // Inicijalizujemo tijelo zahtjeva

    // Skupljamo podatke koje klijent šalje
    req.on("data", chunk => body += chunk);

    // Kada dobijemo cijelo tijelo, obrađujemo ga
    req.on("end", () => {
      const tasks = readTasks(); // Čitamo postojeće zadatke
      const newTask = JSON.parse(body); // Pretvaramo JSON u objekat
      newTask.id = Date.now(); // Dodajemo jedinstveni ID
      newTask.status = false; // Po defaultu zadatak nije završen
      tasks.push(newTask); // Dodajemo novi zadatak u listu
      writeTasks(tasks); // Snimamo sve zadatke nazad u fajl
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(newTask)); // Vraćamo novokreirani zadatak
    });
  }

  // --- DELETE (DELETE) ---
  else if (req.method === "DELETE" && req.url.startsWith("/tasks/")) {
    const id = parseInt(req.url.split("/")[2]); // Iz URL-a uzimamo ID zadatka
    let tasks = readTasks().filter(t => t.id !== id); // Filtriramo listu i uklanjamo zadatak sa tim ID-em
    writeTasks(tasks); // Snimamo novu listu u fajl
    res.end(JSON.stringify({ message: "Task obrisan" })); // Vraćamo poruku klijentu
  }

  // --- Nedefinisane rute ---
  else {
    res.statusCode = 404; // Ruta ne postoji
    res.end("Ruta ne postoji");
  }
});


// Pokretanje servera na portu 5000
server.listen(5000, () => {
  console.log("Backend radi na portu 5000");
});
