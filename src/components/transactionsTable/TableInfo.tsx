import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info, Settings } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";

function TableInfo() {
  return (
    <Dialog>
      <DialogTrigger>
        <Info className="hover:scale-105" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>How to manage transactions</DialogTitle>
        </DialogHeader>
        <ol className="ml-4 list-decimal">
          <li>Click "Add transaction" button to add transactions.</li>
          <li>
            After you add a transaction, hover on its properties
            to&nbsp;change&nbsp;them.
          </li>
          <li>
            You can change the starting balance
            <br /> and currency in&nbsp;
            <Settings className="inline align-middle" size={16} />
            &nbsp;Settings.
          </li>
          <li>
            After you have some transactions,{" "}
            <Button variant="link" className="m-0 h-fit p-0">
              <Link to="/">Dashboard</Link>
            </Button>{" "}
            will show monthly statistics.
          </li>
        </ol>
      </DialogContent>
    </Dialog>
  );
}

export default TableInfo;
