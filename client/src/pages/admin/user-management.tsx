import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface User {
  id: string;
  email: string;
  fullName: string;
  currentPlan: string;
  createdAt: string;
  isAdmin: boolean;
}

export default function UserManagementPage() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<Record<string, string>>({});

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      return await response.json() as User[];
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ userId, newPlan }: { userId: string; newPlan: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: newPlan }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update plan");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Plan updated",
        description: "User plan has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetUsageMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}/reset-usage`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to reset usage");
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Usage reset",
        description: "User usage counters have been reset",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Reset failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  const handlePlanUpdate = (userId: string) => {
    const newPlan = selectedPlan[userId];
    if (newPlan) {
      updatePlanMutation.mutate({ userId, newPlan });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">
          Manage user accounts, plans, and usage
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {users.length} registered user{users.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Current Plan</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                      <TableCell className="font-medium" data-testid={`email-${user.id}`}>
                        {user.email}
                        {user.isAdmin && (
                          <Badge variant="secondary" className="ml-2">Admin</Badge>
                        )}
                      </TableCell>
                      <TableCell data-testid={`name-${user.id}`}>{user.fullName || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" data-testid={`plan-${user.id}`}>
                          {user.currentPlan}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`joined-${user.id}`}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Select
                            value={selectedPlan[user.id] || user.currentPlan}
                            onValueChange={(value) => 
                              setSelectedPlan({ ...selectedPlan, [user.id]: value })
                            }
                          >
                            <SelectTrigger className="w-[120px]" data-testid={`select-plan-${user.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">Basic</SelectItem>
                              <SelectItem value="pro">Pro</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePlanUpdate(user.id)}
                            disabled={
                              !selectedPlan[user.id] || 
                              selectedPlan[user.id] === user.currentPlan ||
                              updatePlanMutation.isPending
                            }
                            data-testid={`button-update-plan-${user.id}`}
                          >
                            Update
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => resetUsageMutation.mutate(user.id)}
                            disabled={resetUsageMutation.isPending}
                            data-testid={`button-reset-usage-${user.id}`}
                          >
                            Reset Usage
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
