import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  useCreateApp, 
  useUpdateApp, 
  useGetApp, 
  getGetAppQueryKey,
  getListAppsQueryKey,
  getGetAppStatsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const appSchema = z.object({
  name: z.string().min(1, "Name is required"),
  packageName: z.string().min(1, "Package name is required"),
  version: z.string().min(1, "Version is required"),
  size: z.string().min(1, "Size is required"),
  type: z.enum(["APP", "GAME"]),
  category: z.string().min(1, "Category is required"),
  status: z.enum(["ONLINE", "OFFLINE"]),
  description: z.string().min(1, "Description is required"),
  modFeatures: z.string().min(1, "Mod features are required"),
  iconInitials: z.string().min(1, "Initials required").max(3),
  iconColor: z.string().min(1, "Color required"),
});

type AppFormValues = z.infer<typeof appSchema>;

interface AppFormProps {
  appId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppForm({ appId, open, onOpenChange }: AppFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isEditing = !!appId;

  const { data: app, isLoading: appLoading } = useGetApp(appId || "", {
    query: { enabled: isEditing, queryKey: getGetAppQueryKey(appId || "") }
  });

  const form = useForm<AppFormValues>({
    resolver: zodResolver(appSchema),
    defaultValues: {
      name: "",
      packageName: "com.example.app",
      version: "1.0.0",
      size: "50MB",
      type: "GAME",
      category: "ACTION",
      status: "OFFLINE",
      description: "",
      modFeatures: "UNLOCKED",
      iconInitials: "AM",
      iconColor: "hsl(var(--primary))",
    },
  });

  useEffect(() => {
    if (app && isEditing) {
      form.reset({
        name: app.name,
        packageName: app.packageName,
        version: app.version,
        size: app.size,
        type: app.type as "APP" | "GAME",
        category: app.category,
        status: app.status as "ONLINE" | "OFFLINE",
        description: app.description,
        modFeatures: app.modFeatures,
        iconInitials: app.iconInitials,
        iconColor: app.iconColor,
      });
    } else if (!isEditing) {
      form.reset();
    }
  }, [app, isEditing, form]);

  const createApp = useCreateApp({
    mutation: {
      onSuccess: () => {
        toast({ title: "Mod added", description: "Successfully added to catalog." });
        queryClient.invalidateQueries({ queryKey: getListAppsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAppStatsQueryKey() });
        onOpenChange(false);
      },
      onError: (err) => {
        toast({ title: "Error", description: String(err), variant: "destructive" });
      }
    }
  });

  const updateApp = useUpdateApp({
    mutation: {
      onSuccess: () => {
        toast({ title: "Mod updated", description: "Successfully updated." });
        queryClient.invalidateQueries({ queryKey: getListAppsQueryKey() });
        if (appId) {
          queryClient.invalidateQueries({ queryKey: getGetAppQueryKey(appId) });
        }
        onOpenChange(false);
      },
      onError: (err) => {
        toast({ title: "Error", description: String(err), variant: "destructive" });
      }
    }
  });

  const onSubmit = (data: AppFormValues) => {
    if (isEditing && appId) {
      updateApp.mutate({ id: appId, data });
    } else {
      createApp.mutate({ data });
    }
  };

  const isPending = createApp.isPending || updateApp.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-none border-4 border-black p-0 brutal-shadow-lg bg-card">
        <DialogHeader className="p-6 bg-primary border-b-4 border-black">
          <DialogTitle className="text-2xl font-black uppercase text-primary-foreground">
            {isEditing ? "Edit Mod" : "Add New Mod"}
          </DialogTitle>
        </DialogHeader>
        
        {appLoading && isEditing ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black uppercase">App Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="rounded-none border-2 border-black bg-background font-mono" />
                      </FormControl>
                      <FormMessage className="font-mono text-xs uppercase" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="packageName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black uppercase">Package Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="rounded-none border-2 border-black bg-background font-mono" />
                      </FormControl>
                      <FormMessage className="font-mono text-xs uppercase" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black uppercase">Version</FormLabel>
                      <FormControl>
                        <Input {...field} className="rounded-none border-2 border-black bg-background font-mono" />
                      </FormControl>
                      <FormMessage className="font-mono text-xs uppercase" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black uppercase">Size</FormLabel>
                      <FormControl>
                        <Input {...field} className="rounded-none border-2 border-black bg-background font-mono" />
                      </FormControl>
                      <FormMessage className="font-mono text-xs uppercase" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black uppercase">Category</FormLabel>
                      <FormControl>
                        <Input {...field} className="rounded-none border-2 border-black bg-background font-mono" />
                      </FormControl>
                      <FormMessage className="font-mono text-xs uppercase" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black uppercase">Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-none border-2 border-black bg-background font-mono uppercase font-bold">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-none border-2 border-black bg-card">
                          <SelectItem value="GAME" className="font-mono font-bold uppercase">GAME</SelectItem>
                          <SelectItem value="APP" className="font-mono font-bold uppercase">APP</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="font-mono text-xs uppercase" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black uppercase">Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-none border-2 border-black bg-background font-mono uppercase font-bold">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-none border-2 border-black bg-card">
                          <SelectItem value="ONLINE" className="font-mono font-bold uppercase">ONLINE</SelectItem>
                          <SelectItem value="OFFLINE" className="font-mono font-bold uppercase">OFFLINE</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="font-mono text-xs uppercase" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="iconInitials"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black uppercase">Icon Initials (Max 3)</FormLabel>
                      <FormControl>
                        <Input {...field} maxLength={3} className="rounded-none border-2 border-black bg-background font-black uppercase text-center text-xl" />
                      </FormControl>
                      <FormMessage className="font-mono text-xs uppercase" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="iconColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black uppercase">Icon Color (Hex, HSL, or name)</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input {...field} className="rounded-none border-2 border-black bg-background font-mono" />
                          <div className="w-10 h-10 border-2 border-black shrink-0" style={{ backgroundColor: field.value }}></div>
                        </div>
                      </FormControl>
                      <FormMessage className="font-mono text-xs uppercase" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="modFeatures"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase">Mod Features</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="rounded-none border-2 border-black bg-background font-mono min-h-[100px]" />
                    </FormControl>
                    <FormMessage className="font-mono text-xs uppercase" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black uppercase">Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="rounded-none border-2 border-black bg-background font-mono min-h-[150px]" />
                    </FormControl>
                    <FormMessage className="font-mono text-xs uppercase" />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4 border-t-4 border-black mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  className="rounded-none border-2 border-black font-black uppercase"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="rounded-none border-2 border-black bg-primary text-primary-foreground font-black uppercase brutal-shadow-sm"
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? "Save Changes" : "Add Mod"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
