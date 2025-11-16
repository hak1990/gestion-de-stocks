import React from "react";

interface Props {
  name: string;
  description: string;
  loading: boolean;
  onclose: () => void;
  onChangeName: (Value: string) => void;
  onChangeDescription: (Value: string) => void;
  onSubmit: () => void;
  editMode?: boolean;
}

const CategoryModal: React.FC<Props> = ({
  name,
  description,
  loading,
  onclose,
  onChangeDescription,
  onChangeName,
  editMode,
  onSubmit,
}) => {
  return (
    <dialog id="category_modal" className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">
          {editMode ? "Modifier la Catégorie" : "Nouvelle Catégorie"}
        </h3>
        <input
          type="text"
          placeholder="Nom"
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          className="input input-bordered w-full mb-4"
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => onChangeDescription(e.target.value)}
          className="input input-bordered w-full mb-4"
        />
        <button
          className="btn btn-primary"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading
            ? editMode
              ? "Modification..."
              : "Ajout..."
            : editMode
            ? "Modifier"
            : "Ajouter"}
        </button>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn" onClick={onclose}>
              Close
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default CategoryModal;
