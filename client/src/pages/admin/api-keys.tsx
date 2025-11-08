import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Key, Plus, Trash2, Eye, EyeOff } from "lucide-react";

interface ApiKey {
  id: string;
  service: string;
  key: string;
  createdAt: string;
  updatedAt: string;
}

export default function ApiKeysPage() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newKeyService, setNewKeyService] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const { data: apiKeys = [], isLoading } = useQuery({
    queryKey: ["/api/admin/api-keys"],
    queryFn: async () => {
      const response = await fetch("/api/admin/api-keys");
      if (!response.ok) throw new Error("Failed to fetch API keys");
      return await response.json() as ApiKey[];
    },
  });

  const addKeyMutation = useMutation({
    mutationFn: async ({ service, key }: { service: string; key: string }) => {
      const response = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service, key }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add API key");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/api-keys"] });
      setIsAddDialogOpen(false);
      setNewKeyService("");
      setNewKeyValue("");
      toast({
        title: "API key added",
        description: "The API key has been securely stored",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add key",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (service: string) => {
      const response = await fetch(`/api/admin/api-keys/${service}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete API key");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/api-keys"] });
      toast({
        title: "API key deleted",
        description: "The API key has been removed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete key",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const maskKey = (key: string) => {
    if (key.length <= 8) return "********";
    return key.slice(0, 4) + "****" + key.slice(-4);
  };

  const toggleKeyVisibility = (service: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(service)) {
      newVisible.delete(service);
    } else {
      newVisible.add(service);
    }
    setVisibleKeys(newVisible);
  };

  const handleAddKey = () => {
    if (!newKeyService.trim() || !newKeyValue.trim()) {
      toast({
        title: "Missing fields",
        description: "Please provide both service name and API key",
        variant: "destructive",
      });
      return;
    }
    addKeyMutation.mutate({ service: newKeyService.trim(), key: newKeyValue.trim() });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading API keys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">API Key Management</h1>
          <p className="text-muted-foreground">
            Securely manage third-party API keys
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-api-key">
              <Plus className="mr-2 h-4 w-4" />
              Add API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New API Key</DialogTitle>
              <DialogDescription>
                Add a new third-party service API key securely
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="service">Service Name</Label>
                <Input
                  id="service"
                  placeholder="e.g., groq, resend"
                  value={newKeyService}
                  onChange={(e) => setNewKeyService(e.target.value)}
                  data-testid="input-service-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter the API key"
                  value={newKeyValue}
                  onChange={(e) => setNewKeyValue(e.target.value)}
                  data-testid="input-api-key"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                data-testid="button-cancel-add"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddKey}
                disabled={addKeyMutation.isPending}
                data-testid="button-confirm-add"
              >
                {addKeyMutation.isPending ? "Adding..." : "Add Key"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Stored API Keys
          </CardTitle>
          <CardDescription>
            {apiKeys.length} API key{apiKeys.length !== 1 ? 's' : ''} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No API keys configured
                    </TableCell>
                  </TableRow>
                ) : (
                  apiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id} data-testid={`row-api-key-${apiKey.service}`}>
                      <TableCell className="font-medium" data-testid={`service-${apiKey.service}`}>
                        <Badge variant="outline">{apiKey.service}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm" data-testid={`key-${apiKey.service}`}>
                        {visibleKeys.has(apiKey.service) ? apiKey.key : maskKey(apiKey.key)}
                      </TableCell>
                      <TableCell data-testid={`updated-${apiKey.service}`}>
                        {new Date(apiKey.updatedAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleKeyVisibility(apiKey.service)}
                            data-testid={`button-toggle-visibility-${apiKey.service}`}
                          >
                            {visibleKeys.has(apiKey.service) ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteKeyMutation.mutate(apiKey.service)}
                            disabled={deleteKeyMutation.isPending}
                            data-testid={`button-delete-${apiKey.service}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
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
