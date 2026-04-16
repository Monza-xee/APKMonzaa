"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ShieldAlert, AlertTriangle, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type App = {
  id: string;
  name: string;
  version: string;
  size: string;
  type: string;
  category: string;
  status: string;
  description: string;
  mod_features: string;
  icon_color: string;
  icon_initials: string;
  icon_url: string;
  package_name: string;
  download_url: string;
  uploaded_at: string;
};

const emptyForm = {
  name: "",
  version: "",
  size: "",
  type: "APP",
  category: "",
  status: "ONLINE",
  description: "",
  mod_features: "",
  icon_color: "#facc15",
  icon_initials: "",
  icon_url: "",
  package_name: "",
  download_url: "",
};

export function Admin() {
  const { toast } = useToast();
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteAppId, setDeleteAppId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editApp, setEditApp] = useState<App | null>(null);

  async function fetchApps() {
    setIsLoading(true);
    const { data } = await supabase.from("ListAPKGAMES").select("*");
    setApps(data || []);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchApps();
  }, []);

  async function handleSubmit() {
    setIsSubmitting(true);

    let error;

    if (editApp) {
      const res = await supabase
        .from("ListAPKGAMES")
        .update(form)
        .eq("id", editApp.id);

      error = res.error;
    } else {
      const res = await supabase.from("ListAPKGAMES").insert([
        { ...form, uploaded_at: new Date().toISOString() },
      ]);

      error = res.error;
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: editApp ? "Berhasil diupdate!" : "Berhasil!",
        description: editApp ? "App berhasil diupdate." : "App berhasil ditambahkan.",
      });

      setIsFormOpen(false);
      setForm(emptyForm);
      setEditApp(null);
      fetchApps();
    }

    setIsSubmitting(false);
  }

  async function handleDelete() {
    if (!deleteAppId) return;
    await supabase.from("ListAPKGAMES").delete().eq("id", deleteAppId);
    setDeleteAppId(null);
    fetchApps();
  }

  function handleChange(e: any) {
    setForm((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between bg-card border-4 border-black p-6">
        <div className="flex gap-3">
          <ShieldAlert />
          <h1 className="text-2xl font-black">Admin Panel</h1>
        </div>

        <Button
          onClick={() => {
            setIsFormOpen(true);
            setEditApp(null);
            setForm(emptyForm);
          }}
        >
          <Plus /> Add
        </Button>
      </div>

      {/* TABLE */}
      <div className="border-4 border-black">
        <Table>
          <TableHeader className="bg-black">
            <TableRow>
              <TableHead className="text-white">ID</TableHead>
              <TableHead className="text-white">App</TableHead>
              <TableHead className="text-white">Version</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5}>Loading...</TableCell>
              </TableRow>
            ) : apps.map((app) => (
              <TableRow key={app.id}>
                <TableCell>{app.id.slice(0, 8)}</TableCell>

                <TableCell>{app.name}</TableCell>
                <TableCell>{app.version}</TableCell>

                <TableCell>
                  <Badge>{app.status}</Badge>
                </TableCell>

                <TableCell className="text-right flex gap-2 justify-end">

                  {/* EDIT */}
                  <Button
                    size="icon"
                    onClick={() => {
                      setEditApp(app);
                      setForm(app);
                      setIsFormOpen(true);
                    }}
                  >
                    ✏️
                  </Button>

                  {/* DELETE */}
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => setDeleteAppId(app.id)}
                  >
                    <Trash2 />
                  </Button>

                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-4 w-full max-w-lg border-4 border-black">

            <div className="flex justify-between mb-4">
              <h2 className="font-bold">
                {editApp ? "Edit Mod" : "Add Mod"}
              </h2>

              <button onClick={() => {
                setIsFormOpen(false);
                setEditApp(null);
                setForm(emptyForm);
              }}>
                <X />
              </button>
            </div>

            {Object.keys(emptyForm).map((key) => (
              <Input
                key={key}
                name={key}
                value={form[key]}
                onChange={handleChange}
                placeholder={key}
                className="mb-2"
              />
            ))}

            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>

          </div>
        </div>
      )}

      {/* DELETE DIALOG */}
      <AlertDialog open={!!deleteAppId} onOpenChange={() => setDeleteAppId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Hapus?</AlertDialogTitle>
          <AlertDialogDescription>
            Ga bisa dibalikin loh.
          </AlertDialogDescription>

          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
