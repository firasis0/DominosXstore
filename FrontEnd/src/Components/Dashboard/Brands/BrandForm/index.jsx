import { useState } from "react";

import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";

import BrandImageUploader from "../BrandImageUploader";

import styles from "./styles.module.scss";

const BrandForm = ({
  brand,
  onCancel,
  onSave
}) => {
  const [name, setName] = useState(
    brand?.name || ""
  );

  const [image, setImage] = useState(
    brand?.image_url || ""
  );

  const [imageFile, setImageFile] = useState(null);

  const handleImageChange = (data) => {
    if (!data) {
      setImage("");
      setImageFile(null);
      return;
    }

    setImage(data.preview);
    setImageFile(data.file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) return;

    onSave({
      name: trimmedName,
      image_url: image,
      image_file: imageFile
    });
  };

  return (
    <form
      className={styles.Form}
      onSubmit={handleSubmit}
    >
      <div className={styles.Form__Field}>
        <label>Brand image</label>

        <BrandImageUploader
          value={image}
          onChange={handleImageChange}
        />
      </div>

      <div className={styles.Form__Field}>
        <label htmlFor="brand-name">
          Brand name
        </label>

        <Input
          id="brand-name"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          placeholder="Gaming Mice"
          autoFocus
        />
      </div>

      <div className={styles.Form__Actions}>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={!name.trim()}
        >
          {brand
            ? "Save Changes"
            : "Add Brand"}
        </Button>
      </div>
    </form>
  );
};

export default BrandForm;