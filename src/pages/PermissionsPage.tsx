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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  usePermissions,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
} from "@/hooks/usePermissions";
import { useModules } from "@/hooks/useModules";
import type { Permission, Module } from "@/types";
import type { RootState } from "@/store";
import { canCreate, canUpdate, canDelete } from "@/utils/permissions";

const permissionSchema = z.object({
  name: z.string().min(1, "Permission name is required"),
  action: z.enum(["create", "read", "update", "delete"]),
  moduleId: z.number().min(1, "Module is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type PermissionFormData = z.infer<typeof permissionSchema>;

export default function PermissionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null
  );

  // Get user permissions
  const { permissions: userPermissions } = useSelector(
    (state: RootState) => state.auth
  );
  const canCreatePermissions = canCreate(userPermissions, "Permissions");
  const canUpdatePermissions = canUpdate(userPermissions, "Permissions");
  const canDeletePermissions = canDelete(userPermissions, "Permissions");

  // React Query hooks
  const {
    data: permissionsResponse,
    isLoading: loading,
    error,
  } = usePermissions({ search: searchTerm });
  const permissions = permissionsResponse?.data || [];
  const { data: modulesResponse } = useModules({ isActive: true });
  const modules = modulesResponse?.data || [];
  const createPermissionMutation = useCreatePermission();
  const updatePermissionMutation = useUpdatePermission();
  const deletePermissionMutation = useDeletePermission();

  const form = useForm<PermissionFormData>({
    resolver: zodResolver(permissionSchema) as Resolver<PermissionFormData>,
    defaultValues: {
      name: "",
      action: "read",
      moduleId: 0,
      description: "",
      isActive: true,
    },
  });

  const openCreateDialog = () => {
    setEditingPermission(null);
    form.reset({
      name: "",
      action: "read",
      moduleId: 0,
      description: "",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (permission: Permission) => {
    setEditingPermission(permission);
    form.reset({
      name: permission.name,
      action: permission.action as "create" | "read" | "update" | "delete",
      moduleId: permission.moduleId,
      description: permission.description || "",
      isActive: permission.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (permissionId: number) => {
    if (!confirm("Are you sure you want to delete this permission?")) {
      return;
    }

    deletePermissionMutation.mutate(permissionId);
  };

  const onSubmit = async (data: PermissionFormData) => {
    if (editingPermission) {
      updatePermissionMutation.mutate(
        { id: editingPermission.id, data },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            form.reset();
          },
        }
      );
    } else {
      createPermissionMutation.mutate(data, {
        onSuccess: () => {
          setIsDialogOpen(false);
          form.reset();
        },
      });
    }
  };

  const filteredPermissions = permissions.filter(
    (permission: Permission) =>
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (permission.description &&
        permission.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (permission.module &&
        permission.module.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Permissions</h1>
          <p className="text-muted-foreground">
            Manage system permissions and access controls
          </p>
        </div>
        {canCreatePermissions && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Permission
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingPermission ? "Edit Permission" : "Create Permission"}
                </DialogTitle>
                <DialogDescription>
                  {editingPermission
                    ? "Update the permission information below."
                    : "Add a new permission to the system."}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="moduleId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Module</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(parseInt(value))
                            }
                            value={field.value?.toString() || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select module" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {modules.map((module: Module) => (
                                <SelectItem
                                  key={module.id}
                                  value={module.id.toString()}
                                >
                                  {module.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="action"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Action</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select action" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="create">Create</SelectItem>
                              <SelectItem value="read">Read</SelectItem>
                              <SelectItem value="update">Update</SelectItem>
                              <SelectItem value="delete">Delete</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Permission Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter permission name"
                            {...field}
                          />
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
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter permission description"
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
                            Enable this permission for use in the system
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
                        createPermissionMutation.isPending ||
                        updatePermissionMutation.isPending
                      }
                    >
                      {createPermissionMutation.isPending ||
                      updatePermissionMutation.isPending
                        ? "Saving..."
                        : editingPermission
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
            <CardTitle>Permissions List</CardTitle>
            <CardDescription>A list of all permissions in the system</CardDescription>
          </div>
          <div className="pt-4">
            <div className="flex items-center space-x-2 max-w-md">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading permissions...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {searchTerm
                        ? "No permissions found matching your search."
                        : "No permissions found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPermissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="p-4 align-middle font-medium">
                        {permission.name}
                      </TableCell>
                      <TableCell className="p-4 align-middle">
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300"
                        >
                          {permission.module?.name || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-4 align-middle">
                        <Badge
                          variant="default"
                          className={`${
                            permission.action === "create"
                              ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300"
                              : permission.action === "read"
                              ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300"
                              : permission.action === "update"
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300"
                              : permission.action === "delete"
                              ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300"
                              : ""
                          }`}
                        >
                          {permission.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-4 align-middle">
                        {permission.description || (
                          <span className="text-muted-foreground">
                            No description
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="p-4 align-middle">
                        <Badge
                          variant={
                            permission.isActive ? "default" : "secondary"
                          }
                          className={
                            permission.isActive
                              ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300"
                              : ""
                          }
                        >
                          {permission.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-4 align-middle">
                        <div className="flex items-center space-x-2">
                          {canUpdatePermissions && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(permission)}
                              className="hover:bg-blue-50 hover:border-blue-200 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDeletePermissions && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(permission.id)}
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
