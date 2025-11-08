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
export function requirePlan(minPlan: 'basic' | 'pro' | 'premium') {
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
        return res.status(403).json({
          error: `This feature requires ${minPlan} plan or higher`,
          currentPlan: user.currentPlan,
          requiredPlan: minPlan,
          upgradeUrl: '/pricing'
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
 * Check if user has reached their plan limit for a feature
 */
export async function hasReachedLimit(
  userId: string, 
  feature: 'cvGenerations' | 'coverLetterGenerations' | 'aiRuns'
): Promise<{ reached: boolean; current: number; limit: number }> {
  const user = await storage.getUser(userId);
  if (!user) {
    return { reached: true, current: 0, limit: 0 };
  }

  const plan = pricingConfig.plans[user.currentPlan as keyof typeof pricingConfig.plans];
  if (!plan) {
    return { reached: true, current: 0, limit: 0 };
  }

  const limit = plan.limits[feature];
  
  // -1 means unlimited
  if (limit === -1) {
    return { reached: false, current: 0, limit: -1 };
  }

  // Get current usage count for this month from storage
  const current = await storage.getUsageCount(userId, feature);

  return {
    reached: current >= limit,
    current,
    limit
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
