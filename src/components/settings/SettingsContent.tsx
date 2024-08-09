import StartBalance from "@/components/transactionsTable/StartBalance";
import SelectCurrency from "./SelectCurrency";


interface SettingsContentProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function SettingsContent({ setOpen }: SettingsContentProps) {
  return (
    <div>
      <StartBalance setOpen={setOpen} />
      <SelectCurrency />
    </div>
  );
}

export default SettingsContent;
