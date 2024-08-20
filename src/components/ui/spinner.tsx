import { LoaderCircle } from "lucide-react";

interface SpinnerProps {
  isLoading: boolean;
}

function Spinner({ isLoading }: SpinnerProps) {
  if (isLoading) {
    return <LoaderCircle className="animate-spin" />;
  }
}

export default Spinner;
