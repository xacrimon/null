import "./NavBar.sass";

function NavBar() {
  return (
    <div className="NavBar">
      <div className="Group">
        <div className="LeftBox">
          <h1 className="Logo">null / bin</h1>
        </div>
        <div className="RightBox">
          <button className="CreateButton">+</button>
        </div>
      </div>
    </div>
  );
}

export default NavBar;
