import { TabsTrigger } from "@/components/ui/tabs";

import { settingsTabs } from "./settingsConfig";

interface SettingsTabItemProps {
  value: (typeof settingsTabs)[number];
}

function SettingsTabTrigger({ value }: SettingsTabItemProps) {
  return (
    <TabsTrigger
      value={value}
      className="w-full px-8 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm"
    >
      <span className="first-letter:capitalize">{value}</span>
    </TabsTrigger>
  );
}

export default SettingsTabTrigger;
