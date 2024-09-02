import { MonthNames } from "@/features/periods/periodsCalculator";

interface WeekNumberProps {
  weekNumber: number;
  monthName: MonthNames;
}

function WeekNumber({ weekNumber, monthName }: WeekNumberProps) {
  return (
    <tr>
      <td colSpan={6} className="text-center">
        <h2 className="text-xl">
          {weekNumber === 1 ? (
            <>
              Week №{weekNumber}: {monthName}
            </>
          ) : (
            <>Week №{weekNumber}</>
          )}
        </h2>
      </td>
    </tr>
  );
}

export default WeekNumber;
