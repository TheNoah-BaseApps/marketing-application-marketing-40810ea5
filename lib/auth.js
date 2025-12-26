import { verifyToken, getTokenFromRequest } from './jwt';
import { query } from './database/aurora';

export async function getCurrentUser(request) {
  try {
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);
    
    if (!payload || !payload.userId) {
      return null;
    }

    const result = await query(
      'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
      [payload.userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function requireAuth(request) {
  const user = await getCurrentUser(request);
  
  if (!user) {
    return {
      error: 'Unauthorized',
      status: 401
    };
  }

  return { user };
}

export async function requireRole(request, allowedRoles) {
  const { user, error, status } = await requireAuth(request);
  
  if (error) {
    return { error, status };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      error: 'Forbidden - Insufficient permissions',
      status: 403
    };
  }

  return { user };
}

export function canCreate(userRole) {
  return ['admin', 'manager', 'marketer'].includes(userRole);
}

export function canUpdate(userRole, resourceOwnerId, currentUserId) {
  if (userRole === 'admin' || userRole === 'manager') {
    return true;
  }
  
  if (userRole === 'marketer' && resourceOwnerId === currentUserId) {
    return true;
  }
  
  return false;
}

export function canDelete(userRole, resourceOwnerId, currentUserId) {
  if (userRole === 'admin' || userRole === 'manager') {
    return true;
  }
  
  if (userRole === 'marketer' && resourceOwnerId === currentUserId) {
    return true;
  }
  
  return false;
}

export function canRead(userRole) {
  return ['admin', 'manager', 'marketer', 'analyst'].includes(userRole);
}