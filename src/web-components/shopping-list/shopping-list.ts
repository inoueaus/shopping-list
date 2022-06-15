//prettier-ignore
import { getDatabase, ref, onValue, set, DatabaseReference, push, remove, child, get, Unsubscribe } from "firebase/database";
import { html, LitElement, PropertyValueMap } from "lit";
import { state, query, property } from "lit/decorators.js";
import styles, { listCss, stickyTitles } from "./css";
import sharedStyles from "../shared-css";
import ShoppingItemDetails from "./shopping-item-details";
import { firebaseApp } from "@firebase-logic";
import { ShoppingListData, ShoppingListItem } from "./types";

export default class ShoppingList extends LitElement {
  #uid: string = "";
  #listId: string = "";
  #listRef!: DatabaseReference;
  #listDataRef!: DatabaseReference;
  #notificationRef!: DatabaseReference;
  #cancelCallback: Unsubscribe | null = null;
  #listData: ShoppingListData | null = null;
  #clickedItemId: string | null = null;

  @property({ reflect: true, attribute: "hide-list", type: Boolean })
  hideList = false;
  @state()
  sortedData: (ShoppingListItem & { key: string })[] | null = null;
  @state()
  listName: string | null = null;
  @state()
  private _adding = false;
  @state()
  private _initLoading = true;
  @query("form")
  form!: HTMLFormElement;
  @query("shopping-item-details")
  private _shoppingItemDetails!: ShoppingItemDetails;

  static styles = [styles, sharedStyles, listCss, stickyTitles];
  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    this._shoppingItemDetails.setAttribute("uid", this.#uid);
    this._shoppingItemDetails.setAttribute("list-id", this.#listId);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.#cancelCallback) this.#cancelCallback();
  }

  static get observedAttributes(): string[] {
    return ["uid", "list-id"];
  }
  attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    if (!value) return;
    if (name === "uid") this.#uid = value;
    if (name === "list-id") this.#listId = value;
    if (this.#uid && this.#listId) {
      if (this.#cancelCallback) this.#cancelCallback();
      const db = getDatabase(firebaseApp);
      this.#listRef = ref(db, `${this.#uid}/SHOPPING-LISTS/${this.#listId}/`);
      this.#listDataRef = ref(db, `${this.#uid}/SHOPPING-LISTS/${this.#listId}/data`);
      get(child(this.#listRef, "listName")).then((val) => (this.listName = val.val()));
      this.#notificationRef = ref(db, `NOTIFICATIONS/${this.#uid}`);
      this.#cancelCallback = onValue(
        this.#listDataRef,
        (snapshot) => {
          this._initLoading = false;
          const data = snapshot.val() as ShoppingListData | null;
          if (!data || Object.keys(data).length === 0) {
            this.#listData = null;
            this.sortedData = null;
            return;
          }
          const keys = Object.keys(data);
          if (Object.values(data).some((value) => isNaN(Number(value.order)))) {
            keys.forEach((key, index) => (data[key].order = index)); // Reset order if order not present any children
            set(this.#listRef, data);
            return;
          }
          this.#listData = data;
          this.sortedData = Object.keys(this.#listData)
            .map((key) => ({ key, ...this.#listData![key] }))
            .sort((a, b) => (a.order < b.order ? -1 : 1));
        },
        (error) => alert(error)
      );
    }
  }

  #handleNewItemInput: EventListener = (event) => {
    const input = event.currentTarget;
    if (!(input instanceof HTMLInputElement)) throw Error("Event target not input.");
    if (input.value.length === input.maxLength) {
      input.setAttribute("class", "invalid");
    } else {
      input.hasAttribute("class") && input.removeAttribute("class");
    }
  };

  #handleItemClick: EventListener = (event) => {
    const target = event.currentTarget;
    if (!(target instanceof HTMLLIElement || target instanceof HTMLButtonElement)) return;
    const id = target.id;
    if (event instanceof MouseEvent || event instanceof TouchEvent) {
      if (this.#clickedItemId === id) {
        this.#deleteItem(id); // only delete on mouse events
        this.#clickedItemId = null;
      } else {
        this.#clickedItemId = id;
        setTimeout(() => {
          this.#clickedItemId = null;
        }, 400);
      }
    }
  };

  #toggleHideListOnClick: EventListener = () => {
    this.hideList = !this.hideList;
  };

  #deleteItem = (id: string) => {
    if (!(this.#listData && this.#listRef)) return;
    remove(child(this.#listDataRef, id));
  };

  #handleDeleteList = () => {
    remove(this.#listRef).then(() => {
      const deletedEvent = new Event("deleted");
      this.dispatchEvent(deletedEvent);
    });
  };

  #handleAddItem: EventListener = async (event) => {
    event.preventDefault();
    if (this._adding) return;
    const formData = new FormData(this.form);
    const item = String(formData.get("item")!).trim();
    if (item.length > 32) return;
    const dateAdded = new Date().getTime();
    this._adding = true;
    const newData: ShoppingListItem = {
      item,
      dateAdded,
      order: this.#listData ? Object.keys(this.#listData).length + 1 : 0,
      memo: "",
      amount: 1,
      priority: false,
    };
    push(this.#listDataRef, newData)
      .then(() => {
        fetch(process.env.NOTIFICATION_URI!).then(() =>
          set(this.#notificationRef, { item: newData.item, uid: this.#uid })
        );
      })
      .catch((error) => alert(error))
      .finally(() => (this._adding = false));
    this.form.reset();
  };

  #handleDragStart: EventListener = (event) => {
    if (!(event instanceof DragEvent && event.dataTransfer)) return;
    const target = event.currentTarget;
    if (!(target instanceof HTMLLIElement)) return;
    const id = target.id;
    event.dataTransfer.setData("id", id);
    event.dataTransfer.setData("listId", this.#listId);
    event.dataTransfer.dropEffect = "move";
  };
  #handleDragOver: EventListener = (event) => {
    if (!(event instanceof DragEvent && event.dataTransfer)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };
  #handleDrop: EventListener = (event) => {
    if (!(event instanceof DragEvent && event.dataTransfer)) return;
    const target = event.currentTarget;
    if (!(target instanceof HTMLLIElement)) return;
    const droppedLocationId = target.id;
    const draggedId = event.dataTransfer.getData("id");
    if (droppedLocationId === draggedId) {
      this._shoppingItemDetails.setAttribute("key", draggedId);
      return;
    }
    if (!this.#listData) return;
    const droppedLocationData = this.#listData[droppedLocationId];
    const draggedData = this.#listData[draggedId];
    if (!(draggedData && droppedLocationData)) return;
    const newSortedArray = this.sortedData!.map((item) => item.key).filter((key) => key !== draggedId);
    // const worker = new Worker("change-order.js");
    // worker.onmessage = (event) => set(this.#listDataRef, event.data);
    // worker.postMessage({ newSortedArray, droppedLocationId, draggedData, data: this.#listData, draggedId });
    const indexOfDropped = newSortedArray.findIndex((key) => key === droppedLocationId);
    const itemsUpToDropped = newSortedArray.slice(0, indexOfDropped);
    const itemsAfterDropped = newSortedArray.slice(indexOfDropped);
    const changedOrder = [...itemsUpToDropped, draggedId, ...itemsAfterDropped];
    const newData = { ...this.#listData };
    changedOrder.forEach((key, index) => {
      newData[key].order = index;
    });
    set(this.#listDataRef, newData);
  };

  render() {
    const list = this.sortedData
      ? this.sortedData.map(
          (item) => html`<li
            id=${item.key!}
            draggable="true"
            ?priority=${item.priority}
            @click=${this.#handleItemClick}
            @dragstart=${this.#handleDragStart}
            @dragover=${this.#handleDragOver}
            @drop=${this.#handleDrop}
          >
            <span>${item.item}</span>
            ${item.amount && item.amount > 1 ? html`<small>x${item.amount}</small>` : ""}
          </li>`
        )
      : html`<button class="delete" type="button" @click=${this.#handleDeleteList}>Delete List?</button>`;

    return html`
      <div class="card">
        <div @click=${this.#toggleHideListOnClick} id="title">
          <h2>${this.listName}</h2>
          <span>${this.sortedData?.length ?? 0}</span>
        </div>
        <div id="contents">
          <form @submit=${this.#handleAddItem} autocomplete="off">
            <input
              @input=${this.#handleNewItemInput}
              id="item"
              name="item"
              minlength="1"
              type="text"
              maxlength="33"
              required
            />
            <button id="add" type="submit">
              ${this._adding ? html`<loading-spinner color="white" />` : html`<plus-icon color="white" />`}
            </button>
          </form>
          <ul>
            ${this._initLoading ? html`<loading-spinner />` : list}
          </ul>
        </div>
        <shopping-item-details></shopping-item-details>
      </div>
    `;
  }
}
