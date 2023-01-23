import ReactDOM from "react-dom";
import React from "react";

// TODO: replace with better modal

export const Backdrop: React.FC<{ onDismiss: () => void }> = (props) => {
  return <div className={""} onClick={props.onDismiss} />;
};

const ModalOverlay: React.FC<{
  title?: string;
  content?: React.ReactNode;
  onDismiss: () => void;
}> = (props) => {
  const { title, content, onDismiss } = props;
  return (
    <div className={""}>
      <button className={""} onClick={onDismiss}>
        <img src={""} alt="Button to close modal" />
      </button>
      <h3>{title}</h3>
      <div className={""}>{content}</div>
    </div>
  );
};

const Modal: React.FC<{
  title?: string;
  content?: React.ReactNode;
  onDismiss: () => void;
}> = (props) => {
  const { title, content, onDismiss } = props;
  return (
    <>
      {ReactDOM.createPortal(
        <Backdrop onDismiss={onDismiss} />,
        document.getElementById("backdrop-root")!
      )}
      {ReactDOM.createPortal(
        <ModalOverlay title={title} content={content} onDismiss={onDismiss} />,
        document.getElementById("overlay-root")!
      )}
    </>
  );
};

export default Modal;
