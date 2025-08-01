import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Edit, Trash2, Search, Users } from "lucide-react";
import { useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EnhancedButton as Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from "@/hooks/useRoles";
import { useGroups, useAssignRolesToGroup } from "@/hooks/useGroups";
import type { Role, Group } from "@/types";
import type { RootState } from "@/store";
import { canCreate, canUpdate, canDelete } from "@/utils/permissions";

const roleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type RoleFormData = z.infer<typeof roleSchema>;

export default function RolesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  
  // Group assignment state
  const [isGroupAssignDialogOpen, setIsGroupAssignDialogOpen] = useState(false);
  const [selectedRoleForGroups, setSelectedRoleForGroups] = useState<Role | null>(null);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);

  // Get user permissions from Redux store
  const { permissions: userPermissions } = useSelector(
    (state: RootState) => state.auth
  );

  // Check permissions for Roles module
  const canCreateRoles = canCreate(userPermissions, "Roles");
  const canUpdateRoles = canUpdate(userPermissions, "Roles");
  const canDeleteRoles = canDelete(userPermissions, "Roles");
  
  // Check permissions for Assignments module
  const canCreateAssignments = canCreate(userPermissions, "Assignments");

  // React Query hooks
  const {
    data: rolesResponse,
    isLoading: loading,
    error,
  } = useRoles({ search: searchTerm });
  const roles = rolesResponse?.data || [];
  const { data: groupsResponse } = useGroups({});
  const groups = groupsResponse?.data || [];
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();
  const assignRolesToGroupMutation = useAssignRolesToGroup();

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema) as Resolver<RoleFormData>,
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  });

  const openCreateDialog = () => {
    setEditingRole(null);
    form.reset({
      name: "",
      description: "",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (role: Role) => {
    setEditingRole(role);
    form.reset({
      name: role.name,
      description: role.description || "",
      isActive: role.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (roleId: number) => {
    if (!confirm("Are you sure you want to delete this role?")) {
      return;
    }

    deleteRoleMutation.mutate(roleId);
  };

  const onSubmit = async (data: RoleFormData) => {
    if (editingRole) {
      updateRoleMutation.mutate(
        { id: editingRole.id, data },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            form.reset();
          },
        }
      );
    } else {
      createRoleMutation.mutate(data, {
        onSuccess: () => {
          setIsDialogOpen(false);
          form.reset();
        },
      });
    }
  };

  // Group assignment functions
  const openGroupAssignDialog = (role: Role) => {
    setSelectedRoleForGroups(role);
    setSelectedGroupIds([]);
    setIsGroupAssignDialogOpen(true);
  };

  const closeGroupAssignDialog = () => {
    setSelectedRoleForGroups(null);
    setSelectedGroupIds([]);
    setIsGroupAssignDialogOpen(false);
  };

  const handleGroupSelection = (groupId: number, checked: boolean) => {
    if (checked) {
      setSelectedGroupIds(prev => [...prev, groupId]);
    } else {
      setSelectedGroupIds(prev => prev.filter(id => id !== groupId));
    }
  };

  const handleAssignGroups = async () => {
    if (!selectedRoleForGroups || selectedGroupIds.length === 0) return;
    
    for (const groupId of selectedGroupIds) {
      await assignRolesToGroupMutation.mutateAsync({
        groupId,
        roleIds: [selectedRoleForGroups.id]
      });
    }
    closeGroupAssignDialog();
  };

  const filteredRoles = roles.filter(
    (role: Role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.description &&
        role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Roles</h1>
          <p className="text-muted-foreground">
            Manage system roles and their permissions
          </p>
        </div>
        {canCreateRoles && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Role
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingRole ? "Edit Role" : "Create Role"}
                </DialogTitle>
                <DialogDescription>
                  {editingRole
                    ? "Update the role information below."
                    : "Add a new role to the system."}
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
                        <FormLabel>Role Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter role name" {...field} />
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
                            placeholder="Enter role description"
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
                            Enable this role for use in the system
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
                        createRoleMutation.isPending ||
                        updateRoleMutation.isPending
                      }
                    >
                      {createRoleMutation.isPending ||
                      updateRoleMutation.isPending
                        ? "Saving..."
                        : editingRole
                        ? "Update"
                        : "Create"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Group Assignment Dialog */}
        <Dialog open={isGroupAssignDialogOpen} onOpenChange={setIsGroupAssignDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Role to Groups</DialogTitle>
              <DialogDescription>
                Select groups to assign the role "{selectedRoleForGroups?.name}" to.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="max-h-60 overflow-y-auto space-y-2">
                {groups.map((group: Group) => (
                  <div key={group.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`group-${group.id}`}
                      checked={selectedGroupIds.includes(group.id)}
                      onCheckedChange={(checked) => handleGroupSelection(group.id, checked as boolean)}
                    />
                    <label htmlFor={`group-${group.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {group.name}
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={closeGroupAssignDialog}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAssignGroups}
                  disabled={selectedGroupIds.length === 0 || assignRolesToGroupMutation.isPending}
                >
                  {assignRolesToGroupMutation.isPending ? "Assigning..." : "Assign"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
            <CardTitle>Roles List</CardTitle>
            <CardDescription>A list of all roles in the system</CardDescription>
          </div>
          <div className="pt-4">
            <div className="flex items-center space-x-2 max-w-md">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading roles...</div>
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
                {filteredRoles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      {searchTerm
                        ? "No roles found matching your search."
                        : "No roles found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoles.map((role: Role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>
                        {role.description || (
                          <span className="text-muted-foreground">
                            No description
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={role.isActive ? "default" : "secondary"}
                          className={
                            role.isActive
                              ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300"
                              : ""
                          }
                        >
                          {role.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300"
                        >
                          {role.permissions?.length || 0} permissions
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {canUpdateRoles && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(role)}
                              className="hover:bg-blue-50 hover:border-blue-200 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canCreateAssignments && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openGroupAssignDialog(role)}
                              title="Assign to Groups"
                              className="hover:bg-green-50 hover:border-green-200 transition-colors"
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                          )}
                          {canDeleteRoles && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(role.id)}
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
