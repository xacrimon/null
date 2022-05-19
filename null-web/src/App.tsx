import NavBar from "./components/NavBar";
import PasteCreator from "./components/PasteCreator";

function App() {
  const style = {
    backgroundColor: "#ffffff",
  };

  return (
    <div style={style} className="App">
      <NavBar />
      <PasteCreator />
    </div>
  );
}

export default App;
