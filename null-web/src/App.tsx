import NavBar from "./components/NavBar";
import Editor from "./components/Editor";

function App() {
  const style = {
    backgroundColor: "#ffffff",
  };

  return (
    <div style={style} className="App">
      <NavBar />
      <Editor />
    </div>
  );
}

export default App;
