import React from "react";

import ListItem from "../UI/ListItem";

const ListLogic = (props) => {
  if (props.loading && props.list.length === 0) {
    return <p style={{ textAlign: "center" }}>Loading...</p>;
  }
  if (props.list.length === 0) {
    return <p style={{ textAlign: "center" }}>No items in shopping list</p>;
  }
  return (
    <ul className={props.styles.list}>
      {props.list.map((item, index) => (
        <ListItem
          onClick={props.removeClicked.bind(null, item.id)}
          id={item.id}
          key={item.id}
          last={index === 0}
        >
          {item.item}
        </ListItem>
      ))}
    </ul>
  );
};

export default ListLogic;
