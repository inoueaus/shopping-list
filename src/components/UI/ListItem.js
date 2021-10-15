import React from "react";

import styles from "./ListItem.module.css";

const ListItem = props => {
    return (
        <li onClick={props.onClick} className={styles['list-item']}>{props.children}</li>
    );
};

export default ListItem;