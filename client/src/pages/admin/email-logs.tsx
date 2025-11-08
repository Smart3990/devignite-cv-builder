import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Mail, CheckCircle2, XCircle, Clock } from "lucide-react";

interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  createdAt: string;
  sentAt?: string;
  error?: string;
}

export default function EmailLogsPage() {
  const { data: emails = [], isLoading } = useQuery({
    queryKey: ["/api/admin/emails"],
    queryFn: async () => {
      const response = await fetch("/api/admin/emails");
      if (!response.ok) throw new Error("Failed to fetch email logs");
      return await response.json() as EmailLog[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading email logs...</p>
        </div>
      </div>
    );
  }

  const statusCounts = {
    sent: emails.filter(e => e.status === 'sent').length,
    failed: emails.filter(e => e.status === 'failed').length,
    pending: emails.filter(e => e.status === 'pending').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Email Logs</h1>
        <p className="text-muted-foreground">
          Monitor all emails sent from the platform
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="count-emails-sent">
              {statusCounts.sent}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully delivered
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="count-emails-failed">
              {statusCounts.failed}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Delivery failed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="count-emails-pending">
              {statusCounts.pending}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Queued for delivery
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Emails</CardTitle>
          <CardDescription>
            {emails.length} email{emails.length !== 1 ? 's' : ''} logged
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Sent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emails.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No emails found
                    </TableCell>
                  </TableRow>
                ) : (
                  emails.map((email) => (
                    <TableRow key={email.id} data-testid={`row-email-${email.id}`}>
                      <TableCell className="font-medium" data-testid={`recipient-${email.id}`}>
                        {email.recipient}
                      </TableCell>
                      <TableCell data-testid={`subject-${email.id}`}>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {email.subject}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            email.status === 'sent'
                              ? 'default'
                              : email.status === 'failed'
                              ? 'destructive'
                              : 'secondary'
                          }
                          data-testid={`status-${email.id}`}
                        >
                          {email.status}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`created-${email.id}`}>
                        {new Date(email.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell data-testid={`sent-${email.id}`}>
                        {email.sentAt ? new Date(email.sentAt).toLocaleString() : '-'}
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
