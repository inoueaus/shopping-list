import { css } from "lit";

export default css`
  * {
    box-sizing: border-box;
  }

  :host {
    --primary-color: white;
    --secondary-color: rgb(218, 218, 218);
    --highlight-color: rgb(0, 140, 255);
    --highlight-hover: rgb(26, 152, 255);
    --danger-color: rgb(255, 94, 94);
  }

  .card {
    width: 90%;
    max-width: 500px;
    margin: 1rem auto;
    background-color: var(--primary-color);
    border: 1px solid var(--primary-color);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.168);
    color: black;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    transition: all 0.3s;
  }

  .card[show] {
    display: flex;
  }

  .card[dark] {
    --dark-color: rgb(83, 83, 83);
    background-color: var(--dark-color);
    border-color: var(--dark-color);
    color: white;
  }

  button {
    border: 1px solid var(--highlight-color);
    padding: 0.25rem 0.5rem;
    font-size: 1.1rem;
    height: 50px;
    color: white;
    background-color: var(--highlight-color);
    border-radius: 4px;
    cursor: pointer;
    margin: 0;
  }

  button[active] {
    background-color: var(--secondary-color);
    border-color: var(--secondary-color);
  }
  button[active]:hover {
    background-color: var(--secondary-color);
    border-color: var(--secondary-color);
  }
  button:hover {
    background-color: var(--highlight-hover);
    border-color: var(--highlight-hover);
  }

  form:invalid button {
    background-color: var(--secondary-color);
    border-color: var(--secondary-color);
  }

  button.delete {
    background-color: var(--danger-color);
    border-color: var(--danger-color);
  }

  @media (prefers-color-scheme: light) {
    :host {
      --primary-color: white;
      --secondary-color: rgb(218, 218, 218);
      --highlight-color: rgb(0, 140, 255);
      --highlight-hover: rgb(26, 152, 255);
      color: black;
    }
  }

  @media (prefers-color-scheme: dark) {
    :host {
      --primary-color: rgb(85, 85, 85);
      --secondary-color: rgb(132, 132, 132);
      --highlight-color: rgb(0, 140, 255);
      --highlight-hover: rgb(26, 152, 255);
      color: white;
    }
  }
`;

export const formCss = css`
  form {
    display: flex;
    flex-direction: column;
  }

  form input + label, form input + span, form textarea + span {
    margin-top: 1rem;
  }


  form label, form span {
    margin-bottom: 0.3rem;
  }

  form input {
    height: 45px;
    border: 1px solid var(--secondary-color);
    border-radius: 4px;
    font-size: 1.2rem;
    padding-left: 0.5rem;
    outline: none;
    margin: 0;
    min-width: 50px;
    width: 100%;
  }

  form textarea {
    height: 10vh;
    min-height: 80px;
    padding: 0.5rem;
  }

  form input + button,
  form textarea + button {
    margin-top: 1rem;
  }

  button + button {
    margin-top: 1rem;
  }
  @media (prefers-color-scheme: dark) {
    form label {
      color: white;
    }
  }
`;