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
          className="absolute right-0 top-1/2 -translate-y-1/2 rounded-md bg-foreground px-2 py-1"
          onClick={() => setIsEditing(true)}
        >
          <Pencil size={16} className="text-primary-foreground" />
        </button>
      )}
    </>
  );
}

export default EditCellButton;
