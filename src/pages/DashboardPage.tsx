import { useState } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EnhancedButton as Button } from "@/components/ui/enhanced-button";
import { Badge } from "@/components/ui/badge";

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

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Users,
  Settings,
  Activity,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Clock,
  User,
} from "lucide-react";

import { useMyPermissions } from "@/hooks/useAuth";
import { useModules } from "@/hooks/useModules";
import { useSimulateAction } from "@/hooks/useAuth";
import { canRead } from "@/utils/permissions";
import type { RootState } from "@/store";
import type { Permission, SimulateActionRequest } from "@/types";

const simulateSchema = z.object({
  resource: z.string().min(1, "Module is required"),
  action: z.enum(["create", "read", "update", "delete"]),
});

type SimulateFormData = z.infer<typeof simulateSchema>;

export default function DashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [simulationResult, setSimulationResult] = useState<{
    allowed: boolean;
    reason?: string;
  } | null>(null);

  // React Query hooks
  const { data: permissions = [] } = useMyPermissions();
  const { data: modulesResponse } = useModules({});
  const modules = modulesResponse?.data || [];
  const simulateActionMutation = useSimulateAction();

  // Check if user has read permission for "Modules" module to access simulation
  const canReadModules = canRead(permissions, 'Modules');
  
  // If user can read Modules, they can see all modules in simulation dropdown
  const accessibleModules = canReadModules ? modules : [];
  
  // Check if user has permission to access the simulation feature
  const hasAnyReadPermission = canReadModules;

  const form = useForm<SimulateFormData>({
    resolver: zodResolver(simulateSchema),
    defaultValues: {
      resource: "",
      action: "read",
    },
  });

  const onSimulate = async (data: SimulateFormData) => {
    setSimulationResult(null);

    // Find the module by name to get its ID
    const module = modules.find((m) => m.name === data.resource);
    if (!module) {
      return;
    }

    const simulateRequest: SimulateActionRequest = {
      userId: user?.id || 0,
      moduleId: module.id,
      moduleName: module.name,
      action: data.action,
    };

    simulateActionMutation.mutate(simulateRequest, {
      onSuccess: (response) => {
        setSimulationResult(response);
      },
    });
  };

  const groupedPermissions = (permissions || []).reduce((acc, permission) => {
    const moduleName = permission.module?.name || "Unknown";
    if (!acc[moduleName]) {
      acc[moduleName] = [];
    }
    acc[moduleName].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-8">
      {/* Header Section with User Profile */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName || user?.username}!
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Avatar className="h-10 w-10">
            <AvatarImage src="" alt={user?.username} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-[#f2b878]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Permissions
            </CardTitle>
            <Shield className="h-4 w-4 text-[#f2b878]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Inherited from groups
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#f2b878]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Module Access
            </CardTitle>
            <Settings className="h-4 w-4 text-[#f2b878]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(groupedPermissions).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <BarChart3 className="inline h-3 w-3 mr-1" />
              Active modules
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#f2b878]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Create Actions
            </CardTitle>
            <Activity className="h-4 w-4 text-[#f2b878]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {permissions.filter((p) => p.action === "create").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <CheckCircle className="inline h-3 w-3 mr-1" />
              Creation privileges
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#f2b878]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Admin Level
            </CardTitle>
            <Users className="h-4 w-4 text-[#f2b878]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {permissions.filter(
                (p) => p.module?.name === "Users" && p.action === "delete"
              ).length > 0 ? (
                <span className="text-[#fb982f]">Full</span>
              ) : (
                <span className="text-muted-foreground">Limited</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {permissions.filter(
                (p) => p.module?.name === "Users" && p.action === "delete"
              ).length > 0 ? (
                <>
                  <AlertCircle className="inline h-3 w-3 mr-1" />
                  Administrative access
                </>
              ) : (
                <>
                  <Clock className="inline h-3 w-3 mr-1" />
                  Standard access
                </>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* My Permissions Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Current Permissions</CardTitle>
            </div>
            <CardDescription>
              Permissions inherited through your group memberships
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(groupedPermissions).length === 0 ? (
              <div className="text-center py-6">
                <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No permissions found.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Contact your administrator to assign permissions.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(
                  ([moduleName, modulePermissions], index) => (
                    <div key={moduleName}>
                      {index > 0 && <Separator className="mb-4" />}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-4">
                          <h4 className="font-medium flex items-center space-x-2">
                            <Settings className="h-4 w-4 text-primary" />
                            <span>{moduleName}</span>
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {modulePermissions.length} permission
                            {modulePermissions.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-2 gap-y-2">
                          {modulePermissions.map((permission) => {
                            const getActionColor = (action: string) => {
                              switch (action) {
                                case "create":
                                  return "bg-green-100 text-green-800 border-green-200";
                                case "read":
                                  return "bg-blue-100 text-blue-800 border-blue-200";
                                case "update":
                                  return "bg-yellow-100 text-yellow-800 border-yellow-200";
                                case "delete":
                                  return "bg-red-100 text-red-800 border-red-200";
                                default:
                                  return "bg-gray-100 text-gray-800 border-gray-200";
                              }
                            };
                            return (
                              <Badge
                                key={permission.id}
                                className={`${getActionColor(
                                  permission.action
                                )} justify-center py-1 px-2 text-xs font-medium`}
                                variant="outline"
                              >
                                {permission.action.charAt(0).toUpperCase() +
                                  permission.action.slice(1)}
                              </Badge>
                            );
                          })}
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mt-1">
                            {modulePermissions.length} of 4 possible actions
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Simulate Actions Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">Simulate Action</CardTitle>
            </div>
            <CardDescription className="text-base">
              {hasAnyReadPermission 
                ? "Test if you have permission to perform a specific action on any module"
                : "Permission simulation requires module access"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hasAnyReadPermission ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Module Access</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have read permissions for any modules.
                </p>
                <p className="text-sm text-muted-foreground">
                  Please request permissions from your administrator to access the permission simulation feature.
                </p>
              </div>
            ) : (
              <>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSimulate)}
                    className="space-y-6"
                  >
                    <div className="flex flex-col md:flex-row gap-x-4 gap-y-4 items-end">
                      <FormField
                        control={form.control}
                        name="resource"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Module</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                const selectedModule = accessibleModules?.find(
                                  (m) => m.id.toString() === value
                                );
                                field.onChange(selectedModule?.name || "");
                              }}
                              value={
                                accessibleModules
                                  ?.find((m) => m.name === field.value)
                                  ?.id?.toString() || ""
                              }
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a module" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {accessibleModules?.map((module) => (
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
                                  <SelectValue placeholder="Select an action" />
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

                      <Button
                        type="submit"
                        className="font-semibold flex-shrink-0"
                        disabled={simulateActionMutation.isPending}
                      >
                        {simulateActionMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            Checking...
                          </>
                        ) : (
                          <>
                            <Activity className="h-5 w-5 mr-2" />
                            Check Permission
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>

                {simulationResult && (
                  <div className="mt-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        {simulationResult.allowed ? (
                          <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                        )}
                        <div className="font-semibold text-lg">
                          {simulationResult.allowed
                            ? "Access Granted"
                            : "Access Denied"}
                        </div>
                      </div>

                      <div className="text-sm leading-relaxed pl-0">
                        {simulationResult.allowed
                          ? `You have permission to ${
                              form.getValues("action")
                            } in the ${form.getValues("resource")} module.`
                          : simulationResult.reason}
                      </div>

                      {!simulationResult.allowed && (
                        <div className="text-xs leading-relaxed pl-0 text-muted-foreground">
                          You don't have the required permissions to perform this
                          action.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {simulateActionMutation.error && (
                  <div className="mt-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                        <div className="font-semibold text-lg">Error</div>
                      </div>

                      <div className="text-sm leading-relaxed pl-0">
                        {simulateActionMutation.error.message}
                      </div>

                      <div className="text-xs leading-relaxed pl-0 text-muted-foreground">
                        Please try again or contact support if the issue persists.
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
