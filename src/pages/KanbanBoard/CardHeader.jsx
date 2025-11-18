
import Vector from "../assets/images/Priority.svg";
import "../../design/css/tags.css";

export const Tag = () => {
  return (
    <div className="tag" data-model-id="1:14">
      <img
        className="rectangle"
        alt="Rectangle"
        src="https://c.animaapp.com/3aqvPBte/img/rectangle-1.svg"
      />

      <div className="div" />

      <div className="text-wrapper">7</div>

      <img
        className="priority"
        alt="Priority"
        src={Vector}
      />

      <div className="text-wrapper-2">Appointment Received</div>
    </div>
  );
};
