import Editor from "./Editor";

function PasteCreator() {
  return (
    <div className="PasteCreator">
      <input id="titleInput" placeholder="Title"></input>
      <input id="authorInput" placeholder="Author"></input>
      <input id="langInput" placeholder="Language"></input>
      <Editor />
      <button onClick={submitPaste}>Submit</button>
    </div>
  );
}

function submitPaste() {
  const title = (document.getElementById("titleInput") as HTMLInputElement)
    .value;
  const author = (document.getElementById("authorInput") as HTMLInputElement)
    .value;
  const lang = (document.getElementById("langInput") as HTMLInputElement).value;
}

export default PasteCreator;
