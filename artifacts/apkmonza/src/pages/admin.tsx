import { useState } from "react";
import { 
  useListApps, getListAppsQueryKey, 
  useGetAppStats, getGetAppStatsQueryKey,
  useDeleteApp
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, ShieldAlert, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
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
import { AppForm } from "@/components/app-form";

export function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppId, setEditingAppId] = useState<string | undefined>();
  
  const [deleteAppId, setDeleteAppId] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useGetAppStats({
    query: { queryKey: getGetAppStatsQueryKey() }
  });

  const { data: apps, isLoading: appsLoading } = useListApps(undefined, {
    query: { queryKey: getListAppsQueryKey() }
  });

  const deleteApp = useDeleteApp({
    mutation: {
      onSuccess: () => {
        toast({ title: "App deleted", description: "The mod has been removed from the catalog." });
        queryClient.invalidateQueries({ queryKey: getListAppsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAppStatsQueryKey() });
        setDeleteAppId(null);
      },
      onError: (err) => {
        toast({ title: "Error deleting app", description: String(err), variant: "destructive" });
        setDeleteAppId(null);
      }
    }
  });

  const handleEdit = (id: string) => {
    setEditingAppId(id);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingAppId(undefined);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteAppId) {
      deleteApp.mutate({ id: deleteAppId });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border-4 border-black p-6 brutal-shadow">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-black uppercase m-0 leading-none">Admin Panel</h1>
        </div>
        <Button 
          onClick={handleCreate}
          className="rounded-none border-4 border-black font-black uppercase text-lg h-12 px-6 brutal-shadow-sm brutal-shadow-hover"
        >
          <Plus className="mr-2 h-5 w-5" /> Add New Mod
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Mods" value={stats?.totalMods} loading={statsLoading} className="bg-secondary text-secondary-foreground" />
        <StatCard title="Games" value={stats?.totalGames} loading={statsLoading} className="bg-card" />
        <StatCard title="Apps" value={stats?.totalApps} loading={statsLoading} className="bg-card" />
        <StatCard title="Online" value={stats?.totalOnline} loading={statsLoading} className="bg-primary text-primary-foreground" />
      </div>

      {/* Apps Table */}
      <div className="bg-card border-4 border-black brutal-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-black border-b-4 border-black">
              <TableRow className="hover:bg-black">
                <TableHead className="font-black uppercase text-white py-4">App</TableHead>
                <TableHead className="font-black uppercase text-white py-4">Version</TableHead>
                <TableHead className="font-black uppercase text-white py-4">Type / Cat</TableHead>
                <TableHead className="font-black uppercase text-white py-4">Status</TableHead>
                <TableHead className="font-black uppercase text-white py-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : apps?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 font-mono text-muted-foreground uppercase">
                    No apps found. Add your first mod.
                  </TableCell>
                </TableRow>
              ) : (
                apps?.map((app) => (
                  <TableRow key={app.id} className="border-b-2 border-black hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 border-2 border-black flex items-center justify-center font-black text-sm shrink-0"
                          style={{ backgroundColor: app.iconColor || 'hsl(var(--primary))', color: '#000' }}
                        >
                          {app.iconInitials}
                        </div>
                        <div>
                          <div className="font-black uppercase text-base">{app.name}</div>
                          <div className="font-mono text-xs text-muted-foreground break-all">{app.packageName}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{app.version}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge className="rounded-none border border-black bg-primary text-primary-foreground font-bold text-[10px] uppercase">
                          {app.type}
                        </Badge>
                        <span className="font-mono text-xs font-bold uppercase">{app.category}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`rounded-none border border-black font-bold text-[10px] uppercase ${app.status === 'ONLINE' ? 'bg-secondary text-secondary-foreground' : 'bg-accent text-accent-foreground'}`}>
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleEdit(app.id)}
                          className="rounded-none border-2 border-black h-8 w-8 hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={() => setDeleteAppId(app.id)}
                          className="rounded-none border-2 border-black h-8 w-8 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {isFormOpen && (
        <AppForm 
          appId={editingAppId} 
          open={isFormOpen} 
          onOpenChange={setIsFormOpen} 
        />
      )}

      <AlertDialog open={!!deleteAppId} onOpenChange={(open) => !open && setDeleteAppId(null)}>
        <AlertDialogContent className="rounded-none border-4 border-black brutal-shadow-lg p-0 overflow-hidden sm:max-w-md">
          <div className="bg-destructive text-destructive-foreground p-6 border-b-4 border-black flex items-center gap-3">
            <AlertTriangle className="h-8 w-8" />
            <AlertDialogTitle className="text-2xl font-black uppercase m-0">Confirm Deletion</AlertDialogTitle>
          </div>
          <div className="p-6 bg-card">
            <AlertDialogDescription className="font-mono text-base text-foreground mb-6">
              Are you sure you want to delete this app? This action cannot be undone.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-none border-2 border-black font-black uppercase">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteConfirm}
                className="rounded-none border-2 border-black bg-destructive text-destructive-foreground font-black uppercase hover:bg-destructive/90"
              >
                {deleteApp.isPending ? "Deleting..." : "Delete Mod"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({ title, value, loading, className = "" }: { title: string, value?: number, loading: boolean, className?: string }) {
  return (
    <Card className={`rounded-none border-4 border-black brutal-shadow ${className}`}>
      <CardHeader className="pb-2 border-b-2 border-black/10">
        <CardTitle className="text-sm font-black uppercase opacity-80">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <Skeleton className="h-10 w-16" />
        ) : (
          <div className="text-4xl font-black">{value || 0}</div>
        )}
      </CardContent>
    </Card>
  );
}
