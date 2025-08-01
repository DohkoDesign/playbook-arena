import { SimpleStaffAvailabilities } from "./SimpleStaffAvailabilities";

interface StaffAvailabilitiesViewProps {
  teamId: string;
}

export const StaffAvailabilitiesView = ({ teamId }: StaffAvailabilitiesViewProps) => {
  return <SimpleStaffAvailabilities teamId={teamId} />;
};