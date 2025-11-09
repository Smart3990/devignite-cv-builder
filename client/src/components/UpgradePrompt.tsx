import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Crown, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import pricingConfig from "../../config/pricing.json";

interface UpgradePromptProps {
  open: boolean;
  onClose: () => void;
  promptType: 'cvLimit' | 'coverLetterLimit' | 'aiLimit' | 'linkedIn' | 'premiumTemplates' | 'edits' | 'jobFit' | 'cloudHistory' | 'support';
  currentPlan?: 'basic' | 'pro' | 'premium';
}

export function UpgradePrompt({ open, onClose, promptType, currentPlan = 'basic' }: UpgradePromptProps) {
  const [, setLocation] = useLocation();

  // Get the prompt message from the current plan's upgradePrompts
  const planConfig = pricingConfig.plans[currentPlan];
  const message = planConfig.upgradePrompts?.[promptType] || "Upgrade to unlock this feature!";

  // Determine recommended plan based on feature
  const recommendedPlan = promptType === 'linkedIn' || promptType === 'jobFit' ? 'premium' : 
                         currentPlan === 'basic' ? 'pro' : 'premium';

  const handleUpgrade = () => {
    setLocation("/upgrade");
    onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-br from-primary/20 to-amber-500/20 p-3 rounded-full">
              {recommendedPlan === 'premium' ? (
                <Crown className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              ) : (
                <Sparkles className="h-8 w-8 text-primary" />
              )}
            </div>
          </div>
          <AlertDialogTitle className="text-center text-xl">
            {recommendedPlan === 'premium' ? 'Premium Feature' : 'Upgrade Required'}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-base pt-2">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="bg-muted/50 rounded-lg p-4 my-4">
          <p className="text-sm text-center text-muted-foreground mb-3">
            {recommendedPlan === 'premium' 
              ? 'Unlock all premium features with unlimited access'
              : 'Upgrade to Pro for more features and higher limits'
            }
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-2 py-1 bg-background rounded-full text-xs font-medium">
              {recommendedPlan === 'pro' ? '10 Edits per CV' : 'Unlimited Edits'}
            </span>
            <span className="px-2 py-1 bg-background rounded-full text-xs font-medium">
              {recommendedPlan === 'pro' ? '3 AI Runs/month' : 'Unlimited AI'}
            </span>
            {recommendedPlan === 'premium' && (
              <span className="px-2 py-1 bg-background rounded-full text-xs font-medium">
                LinkedIn Optimizer
              </span>
            )}
          </div>
        </div>

        <AlertDialogFooter className="sm:justify-center gap-2">
          <AlertDialogCancel>Maybe Later</AlertDialogCancel>
          <AlertDialogAction onClick={handleUpgrade} className="bg-gradient-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-600/90">
            <Crown className="mr-2 h-4 w-4" />
            Upgrade Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
