import { Pencil } from "lucide-react";

interface EditCellButtonProps {
  isHovered: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

function EditCellButton({ isHovered, setIsEditing }: EditCellButtonProps) {
  return (
    <>
      {isHovered && (
        <button
          className="bg-slate-800 px-2 py-1 rounded-md absolute top-2 right-1"
          onClick={() => setIsEditing(true)}
        >
          <Pencil size={16} />
        </button>
      )}
    </>
  );
}

export default EditCellButton;
