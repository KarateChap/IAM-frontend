import { useState } from "react";
import { useSelector } from "react-redux";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EnhancedButton as Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useModules,
  useCreateModule,
  useUpdateModule,
  useDeleteModule,
} from "@/hooks/useModules";
import type { Module } from "@/types";
import type { RootState } from "@/store";
import { canCreate, canUpdate, canDelete } from "@/utils/permissions";

const moduleSchema = z.object({
  name: z.string().min(1, "Module name is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type ModuleFormData = z.infer<typeof moduleSchema>;

export default function ModulesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  // Get user permissions
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canCreateModules = canCreate(permissions, "Modules");
  const canUpdateModules = canUpdate(permissions, "Modules");
  const canDeleteModules = canDelete(permissions, "Modules");

  // React Query hooks
  const {
    data: modulesResponse,
    isLoading: loading,
    error,
  } = useModules({ search: searchTerm });
  const modules = modulesResponse?.data || [];
  const createModuleMutation = useCreateModule();
  const updateModuleMutation = useUpdateModule();
  const deleteModuleMutation = useDeleteModule();

  const form = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema) as Resolver<ModuleFormData>,
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  });

  const openCreateDialog = () => {
    setEditingModule(null);
    form.reset({
      name: "",
      description: "",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (module: Module) => {
    setEditingModule(module);
    form.reset({
      name: module.name,
      description: module.description || "",
      isActive: module.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (moduleId: number) => {
    if (!confirm("Are you sure you want to delete this module?")) {
      return;
    }

    deleteModuleMutation.mutate(moduleId);
  };

  const onSubmit = async (data: ModuleFormData) => {
    if (editingModule) {
      updateModuleMutation.mutate(
        { id: editingModule.id, data },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            form.reset();
          },
        }
      );
    } else {
      createModuleMutation.mutate(data, {
        onSuccess: () => {
          setIsDialogOpen(false);
          form.reset();
        },
      });
    }
  };

  const filteredModules = modules.filter(
    (module: Module) =>
      module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (module.description &&
        module.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Modules</h1>
          <p className="text-muted-foreground">
            Manage system modules and their permissions
          </p>
        </div>
        {canCreateModules && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Module
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingModule ? "Edit Module" : "Create Module"}
                </DialogTitle>
                <DialogDescription>
                  {editingModule
                    ? "Update the module information below."
                    : "Add a new module to the system."}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Module Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter module name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter module description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Enable this module for use in the system
                          </div>
                        </div>
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        createModuleMutation.isPending ||
                        updateModuleMutation.isPending
                      }
                    >
                      {createModuleMutation.isPending ||
                      updateModuleMutation.isPending
                        ? "Saving..."
                        : editingModule
                        ? "Update"
                        : "Create"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error?.message || "An error occurred"}
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-sm">
        <CardHeader>
          <div className="space-y-6">
            <CardTitle>Modules List</CardTitle>
            <CardDescription>A list of all modules in the system</CardDescription>
          </div>
          <div className="pt-4">
            <div className="flex items-center space-x-2 max-w-md">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading modules...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      {searchTerm
                        ? "No modules found matching your search."
                        : "No modules found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredModules.map((module: Module) => (
                    <TableRow key={module.id}>
                      <TableCell className="font-medium">
                        {module.name}
                      </TableCell>
                      <TableCell>
                        {module.description || (
                          <span className="text-muted-foreground">
                            No description
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={module.isActive ? "default" : "secondary"}
                          className={
                            module.isActive
                              ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300"
                              : ""
                          }
                        >
                          {module.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300"
                        >
                          {module.permissions?.length || 0} permissions
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {canUpdateModules && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(module)}
                              className="hover:bg-blue-50 hover:border-blue-200 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDeleteModules && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(module.id)}
                              className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
