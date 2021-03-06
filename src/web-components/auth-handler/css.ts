import { css } from "lit";

export default css`
  h1 {
    text-align: center;
    margin-bottom: 2rem;
  }
  .form-group {
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
  }

  .form-group input {
    height: 40px;
    padding-left: 0.5rem;
    border: 1px solid var(--secondary-color);
    border-radius: 4px;
    font-size: large;
  }

  .form-group label {
    margin-bottom: 0.25rem;
  }

  .button-group {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  button {
    border: 1px solid var(--highlight-color);
    padding: 0.25rem 0.5rem;
    font-size: 1.1rem;
    height: 50px;
    color: white;
    background-color: var(--highlight-color);
    border-radius: 4px;
    flex: 0 1 45%;
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
  .button-left {
    border-radius: 4px 0 0 4px;
    flex: 1 0;
  }
  .button-right {
    border-radius: 0 4px 4px 0;
    flex: 1 0;
  }

  .login-form {
    display: flex;
    flex-direction: column;
  }

  .login-form[loading] {
    display: none;
  }

  form button {
    padding: 0.5rem 0.75rem;
    height: 50px;
    max-height: 50px;
    flex: auto;
  }

  form:invalid button {
    background-color: var(--secondary-color);
    border-color: var(--secondary-color);
    cursor: not-allowed;
  }

  #errors {
    --error-color: orange;
    --error-secondary: rgb(255, 225, 170);
    background-color: var(--danger-color);
    padding: 1rem;
    border: 1px solid var(--danger-color);
    border-radius: 4px;
    display: block;
  }

  @media (prefers-color-scheme: dark) {
    * {
      color: white;
    }
  }
`;
