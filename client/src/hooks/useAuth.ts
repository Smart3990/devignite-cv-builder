import { useUser } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { user, isLoaded } = useUser();
  const isAuthenticated = isLoaded && !!user;

  // Automatically sync user to database when authenticated
  const { data: syncedUser } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated, // Only run when user is authenticated
    staleTime: Infinity, // Don't refetch - user data rarely changes
  });

  return {
    user: user ? {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      profileImageUrl: user.imageUrl || null,
    } : undefined,
    isLoading: !isLoaded,
    isAuthenticated,
  };
}
