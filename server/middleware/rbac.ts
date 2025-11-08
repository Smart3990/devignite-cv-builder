import type { Request, Response, NextFunction } from 'express';
import { getUserId } from '../clerkAuth';
import { storage } from '../storage';
import pricingConfig from '../../config/pricing.json';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    currentPlan: string;
  };
}

/**
 * Middleware to require admin role
 */
export async function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      role: user.role,
      currentPlan: user.currentPlan,
    };

    next();
  } catch (error) {
    console.error('[RBAC] Error checking admin permission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Middleware to check if user has a specific plan or higher
 */
export function requirePlan(minPlan: 'basic' | 'pro' | 'premium', featureName?: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      const planHierarchy = { basic: 0, pro: 1, premium: 2 };
      const userPlanLevel = planHierarchy[user.currentPlan as keyof typeof planHierarchy] || 0;
      const requiredPlanLevel = planHierarchy[minPlan];

      if (userPlanLevel < requiredPlanLevel) {
        const displayName = featureName || 'Premium Feature';
        return res.status(403).json({
          error: 'limit',
          errorType: 'access',
          limitType: 'access',
          feature: featureName || 'premiumFeature',
          featureName: displayName,
          currentPlan: user.currentPlan,
          requiredPlan: minPlan,
          message: `${displayName} requires ${minPlan} plan or higher`
        });
      }

      // Attach user info to request
      req.user = {
        id: user.id,
        role: user.role,
        currentPlan: user.currentPlan,
      };

      next();
    } catch (error) {
      console.error('[RBAC] Error checking plan permission:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

/**
 * Check if user has access to a specific feature
 */
export async function hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
  const user = await storage.getUser(userId);
  if (!user) return false;

  const plan = pricingConfig.plans[user.currentPlan as keyof typeof pricingConfig.plans];
  if (!plan) return false;

  // Check if feature is enabled in capabilities
  const capabilities = plan.capabilities as Record<string, boolean>;
  return capabilities[feature] === true;
}

/**
 * Feature display names for error messages
 */
const FEATURE_NAMES: Record<string, string> = {
  cvGenerations: 'CV Generation',
  coverLetterGenerations: 'Cover Letter Generation',
  aiRuns: 'AI Optimization'
};

/**
 * Find the minimum plan that has access to a feature
 */
function getRequiredPlanForFeature(feature: string): 'pro' | 'premium' | null {
  const plans = pricingConfig.plans;
  const basicLimit = plans.basic.limits[feature] || 0;
  const proLimit = plans.pro.limits[feature] || 0;
  const premiumLimit = plans.premium.limits[feature] || 0;
  
  // If basic has limit but pro has higher, Pro is minimum required
  if (basicLimit < proLimit) {
    // But if pro still has limited access and premium has unlimited/much higher, recommend premium
    if (proLimit !== -1 && premiumLimit === -1) {
      return 'premium';
    }
    return 'pro';
  }
  
  // If basic and pro have same limit but premium is higher, premium is required
  if (basicLimit === proLimit && premiumLimit > proLimit) {
    return 'premium';
  }
  
  return 'pro'; // Default to pro for upgrade suggestions
}

/**
 * Check if user has reached their plan limit for a feature
 */
export async function hasReachedLimit(
  userId: string, 
  feature: 'cvGenerations' | 'coverLetterGenerations' | 'aiRuns'
): Promise<{ 
  reached: boolean; 
  current: number; 
  limit: number;
  feature: string;
  featureName: string;
  currentPlan: string;
  requiredPlan?: 'pro' | 'premium';
}> {
  const user = await storage.getUser(userId);
  if (!user) {
    return { 
      reached: true, 
      current: 0, 
      limit: 0,
      feature,
      featureName: FEATURE_NAMES[feature] || feature,
      currentPlan: 'basic',
      requiredPlan: 'pro'
    };
  }

  const plan = pricingConfig.plans[user.currentPlan as keyof typeof pricingConfig.plans];
  if (!plan) {
    return { 
      reached: true, 
      current: 0, 
      limit: 0,
      feature,
      featureName: FEATURE_NAMES[feature] || feature,
      currentPlan: user.currentPlan,
      requiredPlan: 'pro'
    };
  }

  const limit = plan.limits[feature];
  
  // -1 means unlimited
  if (limit === -1) {
    return { 
      reached: false, 
      current: 0, 
      limit: -1,
      feature,
      featureName: FEATURE_NAMES[feature] || feature,
      currentPlan: user.currentPlan
    };
  }

  // Get current usage count for this month from storage
  const current = await storage.getUsageCount(userId, feature);
  const reached = current >= limit;

  return {
    reached,
    current,
    limit,
    feature,
    featureName: FEATURE_NAMES[feature] || feature,
    currentPlan: user.currentPlan,
    requiredPlan: reached ? getRequiredPlanForFeature(feature) || undefined : undefined
  };
}

/**
 * Get user's current plan info
 */
export async function getUserPlanInfo(userId: string) {
  const user = await storage.getUser(userId);
  if (!user) return null;

  const plan = pricingConfig.plans[user.currentPlan as keyof typeof pricingConfig.plans];
  if (!plan) return null;

  return {
    planId: user.currentPlan,
    planName: plan.name,
    planStartDate: user.planStartDate,
    features: plan.features,
    limits: plan.limits,
    capabilities: plan.capabilities,
  };
}
