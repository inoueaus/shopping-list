import React from "react";

import Modal from "../UI/Modal";
import Button from "../UI/Button";

const Settings = (props) => {
  return (
    <Modal onClick={props.toggleShowSettings}>
      <h1 style={{ marginTop: "0" }}>Settings</h1>
      <h3>Your house name: {props.houseName}</h3>

      <Button style={{ height: "45px" }} onClick={props.deleteAll}>
        Empty List
      </Button>
      <Button style={{ height: "45px" }} onClick={props.changeHouse}>
        Change House
      </Button>
    </Modal>
  );
};

export default Settings;
