import { MonthNames } from "@/features/periods/periodsCalculator";

interface WeekNumberProps {
  weekNumber: number;
  monthName: MonthNames;
}

function WeekNumber({ weekNumber, monthName }: WeekNumberProps) {
  return (
    <tr>
      <td colSpan={6} className="text-center">
        <h2 className="mt-3 text-xl">
          Week №{weekNumber}: {monthName}
        </h2>
      </td>
    </tr>
  );
}

export default WeekNumber;
