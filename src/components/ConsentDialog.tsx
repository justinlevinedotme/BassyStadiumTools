import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { setAnalyticsEnabled, initAnalytics } from "@/lib/analytics";

interface ConsentDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ConsentDialog({ open, onClose }: ConsentDialogProps) {
  const handleEnable = () => {
    setAnalyticsEnabled(true);
    initAnalytics();
    onClose();
  };

  const handleDisable = () => {
    setAnalyticsEnabled(false);
    onClose();
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Help Improve BassyStadiumTools</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              We collect anonymous usage data to understand how the app is used,
              catch errors, and prioritize new features.
            </p>
            <p>No personal information is ever collected.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleDisable}>
            No Thanks
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleEnable}>
            Enable Analytics
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
