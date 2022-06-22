import { firebaseApp } from "@firebase-logic";
import BaseModal from "@web-components/base-modal";
import sharedCss, { formCss } from "@web-components/shared-css";
import { DatabaseReference, get, getDatabase, ref, remove, set } from "firebase/database";
import { html, LitElement } from "lit";
import { query, state } from "lit/decorators.js";
import { ShoppingListItem } from "./types";
//prettier-ignore
import { FirebaseStorage, getStorage, ref as getStorageRef, StorageReference, uploadBytes, getBlob } from "firebase/storage";

export default class ShoppingItemDetails extends LitElement {
  #uid: string | null = null;
  #key: string | null = null;
  #listId: string | null = null;
  #ref!: DatabaseReference;
  #storage: FirebaseStorage;
  #storageRef!: StorageReference;
  @state()
  private _data: { item: string; dateAdded: number } & Partial<ShoppingListItem> = {
    dateAdded: 1654820213036,
    item: "",
  };
  @state()
  private _editLoading = false;
  @query("base-modal")
  private _modal!: BaseModal;
  @query("label.file-label")
  private _fileLabel!: HTMLLabelElement;
  @query("img#image-preview")
  private _imgPreview!: HTMLImageElement;

  static styles = [sharedCss, formCss];

  constructor() {
    super();
    this.#storage = getStorage(firebaseApp);
  }

  static get observedAttributes(): string[] {
    return ["uid", "key", "list-id"];
  }
  attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    if (!value) return;
    if (name === "uid") {
      if (this.#uid === value) return;
      this.#uid = value;
      this.#storageRef = getStorageRef(this.#storage, this.#uid);
    }
    if (name === "key") this.#key = value;
    if (name === "list-id") this.#listId = value;
    if (this.#key && this.#uid && this.#listId) {
      this._imgPreview.src = "";
      this._fileLabel.textContent = "Add Image";
      const db = getDatabase(firebaseApp);
      this.#ref = ref(db, `${this.#uid}/SHOPPING-LISTS/${this.#listId}/data/${this.#key}`);
      get(this.#ref)
        .then((data) => {
          if (!data.exists()) throw Error("No data found.");
          this._data = data.val();
          this._modal.toggleAttribute("show", true);
          this._modal.shadowRoot!.getElementById("modal-container")!.scrollTo({ top: 0 });
        })
        .catch(() => this._modal.removeAttribute("show"))
        .finally(() => {
          const activeEl = this.shadowRoot!.activeElement;
          if (activeEl && activeEl instanceof HTMLInputElement) {
            activeEl.blur(); // fix stupid ios auto focus bug
          }
        });

      getBlob(getStorageRef(this.#storageRef, this.#key))
        .then((blob) => this.#convertBlobToB64(blob))
        .then((b64Img) => this._imgPreview.setAttribute("src", b64Img))
        .catch(() => {});
    }
  }

  #handleEditSubmit: EventListener = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) throw Error("Submit event origin not a Form Element");
    const formData = new FormData(form);
    const item = formData.get("item")!.toString().trim();
    const amount = Number(formData.get("amount"));
    if (isNaN(amount)) throw TypeError("Quantity must be a number.");
    const memo = formData.get("memo")!.toString().trim();
    const priority = formData.get("priority")?.toString() === "on";
    const image = formData.get("image");
    this._editLoading = true;
    const newData: ShoppingListItem = {
      item,
      amount,
      memo,
      priority,
      order: this._data!.order!,
      dateAdded: this._data!.dateAdded ?? new Date().getTime(),
    };
    set(this.#ref, newData)
      .then(() => {
        this._modal.removeAttribute("show");
      })
      .finally(() => {
        this._editLoading = false;
        form.reset();
      });
    if (image) {
      if (!(image instanceof File)) throw TypeError("Image must be of File type.");
      uploadBytes(getStorageRef(this.#storageRef, this.#key!), image);
    }
  };

  #handleDeleteClick: EventListener = () => {
    const deleteListItemEvent = new CustomEvent("delete-item", { detail: this.#key });
    this.dispatchEvent(deleteListItemEvent);
    this._modal.removeAttribute("show");
  };

  #convertBlobToB64(blob: Blob | File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== "string") throw TypeError("File Reader must return data string.");
        resolve(result);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  #handleFileInput: EventListener = (event) => {
    const target = event.currentTarget;
    if (!(target instanceof HTMLInputElement) || !target.files)
      throw TypeError("This Listener must be used with a File Input.");
    if (!target.files.length) {
      this._fileLabel.textContent = "New Image";
      return;
    }
    const file = target.files[0];
    const name = file.name.length > 15 ? file.name.substring(0, 7) + "..." : file.name;
    this._fileLabel.textContent = name;

    this.#convertBlobToB64(file).then((b64) => {
      this._imgPreview.setAttribute("src", b64);
    });
  };

  render() {
    const item = this._data.item;
    const dateAdded = new Date(this._data.dateAdded).toISOString().split("T")[0];
    const memo = this._data.memo ?? "";
    const amount = String(this._data.amount ?? 1);
    const priority = this._data.priority ?? false;

    const loadingSpinner = html`<loading-spinner color="white" />`;
    return html`
      <base-modal title="Details">
        <form @submit=${this.#handleEditSubmit}>
          <label for="item">Name</label>
          <input type="text" id="item" name="item" maxlength="32" minlength="1" value=${item} />
          <div class="checkbox-group">
            <input type="checkbox" id="priority" name="priority" ?checked=${priority} />
            <label for="priority">Priority</label>
          </div>
          <label for="date-added">Date Added</label>
          <input type="date" id="date-added" name="dateAdded" value=${dateAdded} readonly />
          <label for="amount">Quantity</label>
          <input id="amount" name="amount" type="number" min="1" value=${amount} />
          <img id="image-preview" />
          <label class="file-label" for="image">New Image</label>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/png, image/jpeg"
            size="4000000"
            @input=${this.#handleFileInput}
          />
          <label for="memo">Memo</label>
          <textarea id="memo" name="memo" .value=${memo}></textarea>
          <button type="submit">${this._editLoading ? loadingSpinner : "Save"}</button>
          <button @click=${this.#handleDeleteClick} type="button" class="delete">Delete</button>
        </form>
      </base-modal>
    `;
  }
}
