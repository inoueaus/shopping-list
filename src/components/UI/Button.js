import styles from "./Button.module.css";

const Button = (props) => {
  return (
    <button
      className={`${styles.button} ${styles[props.className]}`}
      onClick={props.onClick}
      type={props.type}
      style={props.style}
    >
      {props.children}
    </button>
  );
};

export default Button;
