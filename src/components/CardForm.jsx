import "../assets/styles/CardForm.css";

export default function CardForm({ show, close }) {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={close}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()} // prevent closing on inside click
      >
        <button className="close-btn" onClick={close}>
          ✖
        </button>

        <h2>Create / Edit Card</h2>

        <form className="card-form">
          <label>
            Title
            <input type="text" placeholder="Enter card title" />
          </label>

          <label>
            Description
            <textarea placeholder="Enter description"></textarea>
          </label>

          <button type="submit" className="save-btn">
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
