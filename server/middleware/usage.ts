import type { Request, Response, NextFunction } from 'express';
import { getUserId } from '../clerkAuth';
import { storage } from '../storage';
import { PRICING_TIERS, type PricingTier, type Order } from '@shared/schema';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

function getLimitForPackage(packageType: PricingTier): number {
  const tier = PRICING_TIERS[packageType];
  return tier.editsAllowed;
}

async function getOrderForUser(userId: string): Promise<Order | null> {
  // Get the user's most recent active order
  const orders = await storage.getOrdersByUserId(userId);
  if (!orders || orders.length === 0) {
    return null;
  }
  
  // Find the most recent completed order
  const activeOrder = orders
    .filter((order: Order) => order.status === 'completed')
    .sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    
  return activeOrder || null;
}

/**
 * Middleware to enforce usage limits based on pricing tiers
 * @param feature - The feature being accessed (e.g., 'ai_run', 'pdf_generation')
 */
export function enforceUsage(feature: string) {
  return async function (req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get user's active order/package
      const order = await getOrderForUser(userId);
      
      if (!order) {
        return res.status(402).json({ 
          error: 'No active package', 
          message: 'Please purchase a package to use this feature',
          upgrade: true 
        });
      }

      // Check feature-specific limits
      if (feature === 'ai_run' || feature === 'edit') {
        // Check edits remaining
        if (order.editsRemaining <= 0) {
          return res.status(402).json({ 
            error: 'Edit limit reached', 
            message: 'You have used all your edits for this package. Please upgrade to continue.',
            upgrade: true,
            upgradeUrl: '/pricing'
          });
        }
        
        // Decrement edits remaining (will be handled by the route that uses this)
        // Don't decrement here to avoid double-counting
      }

      // For AI features, check if package includes them
      if (feature === 'cover_letter' && !order.hasCoverLetter) {
        return res.status(402).json({
          error: 'Feature not available',
          message: 'Cover letter generation requires Standard or Premium package',
          upgrade: true,
          upgradeUrl: '/pricing'
        });
      }

      if (feature === 'linkedin' && !order.hasLinkedInOptimization) {
        return res.status(402).json({
          error: 'Feature not available',
          message: 'LinkedIn optimization requires Premium package',
          upgrade: true,
          upgradeUrl: '/pricing'
        });
      }

      // Store order in request for use in route handlers
      (req as any).activeOrder = order;
      
      next();
    } catch (error) {
      console.error('Usage enforcement error:', error);
      return res.status(500).json({ error: 'Failed to check usage limits' });
    }
  };
}

/**
 * Helper function to decrement edits remaining for an order
 */
export async function decrementEditsRemaining(orderId: string): Promise<void> {
  await storage.decrementOrderEdits(orderId);
}
