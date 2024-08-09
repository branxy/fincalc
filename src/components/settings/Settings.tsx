import SettingsContent from "./SettingsContent";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { SettingsIcon } from "lucide-react";

import { useMediaQuery } from "@uidotdev/usehooks";
import { useState } from "react";


function Settings() {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("only screen and (min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="w-min p-2.5">
            <SettingsIcon size={22} />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription className="sr-only">
              List of user settings
            </DialogDescription>
          </DialogHeader>
          <SettingsContent setOpen={setOpen} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" className="p-2">
          <SettingsIcon size={22} />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="px-5">
        <DrawerHeader className="px-0 text-left">
          <DrawerTitle>Settings</DrawerTitle>
          <DrawerDescription className="sr-only">
            List of user settings
          </DrawerDescription>
        </DrawerHeader>
        <SettingsContent setOpen={setOpen} />
        <DrawerFooter className="px-0 pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default Settings;
