import StartBalance from "@/components/transactionsTable/StartBalance";
import SelectCurrency from "@/components/settings/SelectCurrency";
import SettingsTabTrigger from "@/components/settings/SettingsTabTrigger";

import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { settingsTabs } from "@/components/settings/settingsConfig";

interface SettingsContentProps {
  orientation: "vertical" | "horizontal";
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function SettingsContent({ orientation, setOpen }: SettingsContentProps) {
  return (
    <div className="w-full">
      <Tabs
        defaultValue="balance"
        orientation={orientation}
        className="flex h-fit w-full flex-col gap-4 sm:w-[480px] md:min-h-52 md:flex-row"
      >
        <TabsList className="flex w-fit justify-start rounded-none bg-transparent px-4 md:h-full md:flex-col md:border-r-2">
          {settingsTabs.map((t) => (
            <SettingsTabTrigger value={t} />
          ))}
        </TabsList>
        <TabsContent value="balance">
          <StartBalance setOpen={setOpen} />
        </TabsContent>
        <TabsContent value="currency">
          <SelectCurrency />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SettingsContent;
