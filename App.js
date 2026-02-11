import { useEffect, useState } from "react"; // Uvozimo React hookove za stanje i efekte
import "./App.css"; // Uvozimo CSS za stilizaciju

function App() {
  const [tasks, setTasks] = useState([]); // Lista svih zadataka
  const [naziv, setNaziv] = useState(""); // Vrijednost input polja za naziv zadatka
  const [opis, setOpis] = useState(""); // Vrijednost input polja za opis zadatka

  // useEffect hook koji se izvršava jednom prilikom učitavanja aplikacije
  useEffect(() => {
    fetch("http://localhost:5000/tasks") // Slanje GET zahtjeva backend-u
      .then(res => res.json()) // Pretvaramo odgovor u JSON
      .then(data => setTasks(data)) // Postavljamo listu zadataka u state
      .catch(err => console.log(err)); // Ako dođe do greške, ispisujemo u konzoli
  }, []);

  // Funkcija za dodavanje novog zadatka
  const dodajTask = () => {
    if (!naziv) return; // Ne dodajemo prazne zadatke
    const newTask = { naziv, opis }; // Kreiramo novi objekat
    fetch("http://localhost:5000/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask) // Šaljemo novi zadatak backend-u
    })
      .then(res => res.json())
      .then(data => {
        setTasks([...tasks, data]); // Dodajemo novi zadatak u listu u frontend-u
        setNaziv(""); // Resetujemo input polja
        setOpis("");
      });
  };

  // Funkcija za brisanje zadatka po ID-u
  const obrisiTask = (id) => {
    fetch(`http://localhost:5000/tasks/${id}`, { method: "DELETE" }) // Slanje DELETE zahtjeva backend-u
      .then(() => setTasks(tasks.filter(t => t.id !== id))); // Ažuriramo frontend listu
  };
  // Označavanje zadatka kao završen
const toggleStatus = (task) => {
  const updatedTask = { ...task, status: !task.status };

  fetch(`http://localhost:5000/tasks/${task.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedTask)
  })
  .then(() => {
    // Update lokalnog state-a
    setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
  });
};


  // Renderovanje komponente
  return (
    <div className="App">
      <h2>To-Do aplikacija</h2>

      <input
        placeholder="Naziv zadatka"
        value={naziv}
        onChange={e => setNaziv(e.target.value)} // Update state kada korisnik kuca
      />
      <br /><br />
      <input
        placeholder="Opis zadatka"
        value={opis}
        onChange={e => setOpis(e.target.value)}
      />
      <br /><br />
      <button onClick={dodajTask}>Dodaj</button>

      <h3>Lista zadataka</h3>
      <ul>
  {tasks.map(task => (
    <li key={task.id}>
      <label>
        <input 
          type="checkbox" 
          checked={task.status} 
          onChange={() => toggleStatus(task)} 
        />
        <span className="checkbox-custom"></span>
        {task.naziv} – {task.status ? "Završeno" : "U toku"}
      </label>
      <button onClick={() => obrisiTask(task.id)}>Obriši</button>
    </li>
  ))}
</ul>

    </div>
  );
}

export default App;
