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
import { Button } from "@/components/ui/button";
import { Sparkles, Zap } from "lucide-react";
import { useLocation } from "wouter";

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  currentPlan: string;
  requiredPlan: "pro" | "premium";
  limitType?: "count" | "access";
  limitReached?: number;
  limitMax?: number;
}

export function UpgradePrompt({
  isOpen,
  onClose,
  feature,
  currentPlan,
  requiredPlan,
  limitType = "access",
  limitReached,
  limitMax,
}: UpgradePromptProps) {
  const [, setLocation] = useLocation();

  const handleUpgrade = () => {
    setLocation("/pricing");
    onClose();
  };

  const planDetails = {
    pro: {
      name: "Pro",
      price: "GHS 50",
      icon: Zap,
      color: "text-blue-600",
    },
    premium: {
      name: "Premium",
      price: "GHS 99",
      icon: Sparkles,
      color: "text-purple-600",
    },
  };

  const plan = planDetails[requiredPlan];
  const PlanIcon = plan.icon;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent data-testid="dialog-upgrade-prompt">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-md bg-muted ${plan.color}`}>
              <PlanIcon className="h-6 w-6" />
            </div>
            <AlertDialogTitle className="text-xl">
              {limitType === "count" ? "Limit Reached" : "Upgrade Required"}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base space-y-3">
            {limitType === "count" ? (
              <p>
                You've used <span className="font-semibold">{limitReached}</span> out of{" "}
                <span className="font-semibold">{limitMax}</span> {feature} this month with
                your <span className="capitalize">{currentPlan}</span> plan.
              </p>
            ) : (
              <p>
                The <span className="font-semibold">{feature}</span> feature is only
                available on the <span className="font-semibold">{plan.name}</span> plan and
                above.
              </p>
            )}
            <p className="text-muted-foreground">
              Upgrade to <span className="font-semibold">{plan.name}</span> for{" "}
              <span className="font-semibold">{plan.price}/month</span> to unlock this
              feature and enjoy unlimited access.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="button-cancel-upgrade">
            Maybe Later
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleUpgrade}
            data-testid="button-view-pricing"
            className="bg-primary hover:bg-primary/90"
          >
            View Pricing
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
