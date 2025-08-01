import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Edit, Trash2, Search, Users, X } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  useGroups,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  useAssignUsersToGroup,
  useRemoveUserFromGroup,
} from "@/hooks/useGroups";
import { useUsers } from "@/hooks/useUsers";
import type { Group, User } from "@/types";
import type { RootState } from "@/store";
import { canCreate, canRead, canUpdate, canDelete } from "@/utils/permissions";

const groupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type GroupFormData = z.infer<typeof groupSchema>;

export default function GroupsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [isUserAssignDialogOpen, setIsUserAssignDialogOpen] = useState(false);
  const [selectedGroupForUsers, setSelectedGroupForUsers] =
    useState<Group | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  // Get user permissions from Redux store
  const { permissions } = useSelector((state: RootState) => state.auth);

  // Check permissions for Groups module
  const canCreateGroups = canCreate(permissions, "Groups");
  const canUpdateGroups = canUpdate(permissions, "Groups");
  const canDeleteGroups = canDelete(permissions, "Groups");

  // Check permissions for Assignments module
  const canCreateAssignments = canCreate(permissions, "Assignments");
  const canReadAssignments = canRead(permissions, "Assignments");

  // React Query hooks
  const { data: groupsResponse, isLoading } = useGroups({ search: searchTerm });
  const groups = groupsResponse?.data || [];
  const { data: usersResponse } = useUsers({});
  const users = usersResponse?.data || [];
  const createGroupMutation = useCreateGroup();
  const updateGroupMutation = useUpdateGroup();
  const deleteGroupMutation = useDeleteGroup();
  const assignUsersToGroupMutation = useAssignUsersToGroup();
  const removeUserFromGroupMutation = useRemoveUserFromGroup();

  const form = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema) as Resolver<GroupFormData>,
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  });

  const openCreateDialog = () => {
    setEditingGroup(null);
    form.reset({
      name: "",
      description: "",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (group: Group) => {
    setEditingGroup(group);
    form.reset({
      name: group.name,
      description: group.description || "",
      isActive: group.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      try {
        await deleteGroupMutation.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete group:", error);
      }
    }
  };

  const openUserAssignDialog = (group: Group) => {
    setSelectedGroupForUsers(group);
    setSelectedUserIds([]);
    setIsUserAssignDialogOpen(true);
  };

  const closeUserAssignDialog = () => {
    setIsUserAssignDialogOpen(false);
    setSelectedGroupForUsers(null);
    setSelectedUserIds([]);
  };

  const handleUserSelection = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUserIds((prev) => [...prev, userId]);
    } else {
      setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
    }
  };

  const handleAssignUsers = async () => {
    if (!selectedGroupForUsers || selectedUserIds.length === 0) return;

    try {
      await assignUsersToGroupMutation.mutateAsync({
        groupId: selectedGroupForUsers.id,
        userIds: selectedUserIds,
      });
      closeUserAssignDialog();
    } catch (error) {
      console.error("Failed to assign users to group:", error);
    }
  };

  const handleRemoveUserFromGroup = async (groupId: number, userId: number) => {
    if (
      window.confirm(
        "Are you sure you want to remove this user from the group?"
      )
    ) {
      try {
        await removeUserFromGroupMutation.mutateAsync({ groupId, userId });
        closeUserAssignDialog();
      } catch (error) {
        console.error("Failed to remove user from group:", error);
      }
    }
  };



  const onSubmit = async (data: GroupFormData) => {
    if (editingGroup) {
      updateGroupMutation.mutate(
        { id: editingGroup.id, data },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            form.reset();
          },
        }
      );
    } else {
      createGroupMutation.mutate(data, {
        onSuccess: () => {
          setIsDialogOpen(false);
          form.reset();
        },
      });
    }
  };

  const filteredGroups = groups.filter(
    (group: Group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.description &&
        group.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Groups</h1>
          <p className="text-muted-foreground">
            Manage user groups and their permissions
          </p>
        </div>
        {canCreateGroups && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Group
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingGroup ? "Edit Group" : "Create Group"}
                </DialogTitle>
                <DialogDescription>
                  {editingGroup
                    ? "Update the group information below."
                    : "Add a new group to the system."}
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
                        <FormLabel>Group Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter group name" {...field} />
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
                            placeholder="Enter group description"
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
                            Enable this group for use in the system
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
                        createGroupMutation.isPending ||
                        updateGroupMutation.isPending
                      }
                    >
                      {createGroupMutation.isPending ||
                      updateGroupMutation.isPending
                        ? "Saving..."
                        : editingGroup
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

      {(createGroupMutation.error ||
        updateGroupMutation.error ||
        deleteGroupMutation.error) && (
        <Alert variant="destructive">
          <AlertDescription>
            {createGroupMutation.error?.message ||
              updateGroupMutation.error?.message ||
              deleteGroupMutation.error?.message}
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-sm">
        <CardHeader>
          <div className="space-y-6">
            <CardTitle>Groups List</CardTitle>
            <CardDescription>A list of all groups in the system</CardDescription>
          </div>
          <div className="pt-4">
            <div className="flex items-center space-x-2 max-w-md">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading groups...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGroups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      {searchTerm
                        ? "No groups found matching your search."
                        : "No groups found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGroups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">
                        {group.name}
                      </TableCell>
                      <TableCell>
                        {group.description || (
                          <span className="text-muted-foreground">
                            No description
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={group.isActive ? "default" : "secondary"}
                          className={
                            group.isActive
                              ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300"
                              : ""
                          }
                        >
                          {group.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300"
                        >
                          {group.users?.length || 0} users
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {(canCreateAssignments || canReadAssignments) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openUserAssignDialog(group)}
                              title={
                                canCreateAssignments
                                  ? "Assign Users"
                                  : "View Users"
                              }
                              className="hover:bg-blue-50 hover:border-blue-200 transition-colors"
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                          )}
                          {canUpdateGroups && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(group)}
                              className="hover:bg-blue-50 hover:border-blue-200 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDeleteGroups && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(group.id)}
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

      {/* User Assignment Dialog */}
      <Dialog
        open={isUserAssignDialogOpen}
        onOpenChange={setIsUserAssignDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {canCreateAssignments ? "Assign Users to" : "View Users in"}{" "}
              {selectedGroupForUsers?.name}
            </DialogTitle>
            <DialogDescription>
              {canCreateAssignments
                ? "Select users to assign to this group. Users will inherit the group's role permissions."
                : "View the users currently assigned to this group. These users inherit the group's role permissions."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="max-h-60 overflow-y-auto space-y-2">
              {users.map((user: User) => {
                const isAlreadyInGroup = selectedGroupForUsers?.users?.some(
                  (u) => u.id === user.id
                );
                const isSelected = selectedUserIds.includes(user.id);

                return (
                  <div
                    key={user.id}
                    className="flex items-center space-x-2 p-2 rounded border"
                  >
                    <Checkbox
                      checked={isSelected || isAlreadyInGroup}
                      disabled={!canCreateAssignments || isAlreadyInGroup}
                      onCheckedChange={(checked: boolean) =>
                        handleUserSelection(user.id, checked)
                      }
                    />
                    <div className="flex-1">
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                      {isAlreadyInGroup && (
                        <div className="text-xs text-green-600">
                          Already in group
                        </div>
                      )}
                    </div>
                    {isAlreadyInGroup && canCreateAssignments && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleRemoveUserFromGroup(
                            selectedGroupForUsers!.id,
                            user.id
                          )
                        }
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={closeUserAssignDialog}>
                {canCreateAssignments ? "Cancel" : "Close"}
              </Button>
              {canCreateAssignments && (
                <Button
                  onClick={handleAssignUsers}
                  disabled={
                    selectedUserIds.length === 0 ||
                    assignUsersToGroupMutation.isPending
                  }
                >
                  {assignUsersToGroupMutation.isPending
                    ? "Assigning..."
                    : `Assign ${selectedUserIds.length} User${
                        selectedUserIds.length !== 1 ? "s" : ""
                      }`}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>


    </div>
  );
}
