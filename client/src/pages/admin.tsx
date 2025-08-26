import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, Globe, FileText, BarChart3, Settings, 
  Plus, Edit, Trash2, Eye, Download, Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    category: "",
    preview_url: "",
    template_data: "{}",
    color_schemes: "[]"
  });

  // Fetch admin data
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const { data: sites } = useQuery({
    queryKey: ["/api/admin/sites"],
  });

  const { data: templates } = useQuery({
    queryKey: ["/api/templates"],
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      const response = await apiRequest("POST", "/api/admin/templates", templateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Template Created",
        description: "New template has been added successfully."
      });
      setNewTemplate({
        name: "",
        description: "",
        category: "",
        preview_url: "",
        template_data: "{}",
        color_schemes: "[]"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Template",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update user plan mutation
  const updateUserPlanMutation = useMutation({
    mutationFn: async ({ userId, plan }: { userId: number; plan: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}`, { plan });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User Updated",
        description: "User plan has been updated successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'default';
      case 'professional': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'live': return 'default';
      case 'draft': return 'secondary';
      case 'paused': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Manage users, templates, and platform settings
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
              </div>
              <Users className="w-8 h-8 text-brand-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sites</p>
                <p className="text-2xl font-bold">{stats?.activeSites || 0}</p>
              </div>
              <Globe className="w-8 h-8 text-brand-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Templates</p>
                <p className="text-2xl font-bold">{templates?.length || 0}</p>
              </div>
              <Template className="w-8 h-8 text-brand-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue (ZAR)</p>
                <p className="text-2xl font-bold">R{stats?.monthlyRevenue || 0}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-brand-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="sites">Sites</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts and subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users?.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-brand-primary text-white rounded-full flex items-center justify-center font-semibold">
                        {user.name?.charAt(0) || user.email.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{user.name || "No name"}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">
                          Joined {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant={getPlanBadgeVariant(user.plan)}>
                        {user.plan}
                      </Badge>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>
                              Update user plan and settings
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Email</Label>
                              <Input value={selectedUser?.email} disabled />
                            </div>
                            <div>
                              <Label>Plan</Label>
                              <Select
                                value={selectedUser?.plan}
                                onValueChange={(plan) => 
                                  updateUserPlanMutation.mutate({ 
                                    userId: selectedUser?.id, 
                                    plan 
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="starter">Starter</SelectItem>
                                  <SelectItem value="professional">Professional</SelectItem>
                                  <SelectItem value="enterprise">Enterprise</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sites" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Management</CardTitle>
              <CardDescription>
                Monitor and manage all websites on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sites?.map((site: any) => (
                  <div key={site.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Globe className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{site.name}</p>
                        <p className="text-sm text-gray-600">
                          {site.subdomain}.impossiblewebsites.com
                        </p>
                        <p className="text-xs text-gray-500">
                          Created {formatDate(site.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant={getStatusBadgeVariant(site.status)}>
                        {site.status}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Template Management</CardTitle>
                  <CardDescription>
                    Create and manage website templates
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-brand-primary hover:bg-brand-secondary">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Template</DialogTitle>
                      <DialogDescription>
                        Add a new template to the platform
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="template-name">Template Name</Label>
                          <Input
                            id="template-name"
                            value={newTemplate.name}
                            onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Professional Law Firm"
                          />
                        </div>
                        <div>
                          <Label htmlFor="template-category">Category</Label>
                          <Select
                            value={newTemplate.category}
                            onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="legal">Legal</SelectItem>
                              <SelectItem value="restaurant">Restaurant</SelectItem>
                              <SelectItem value="healthcare">Healthcare</SelectItem>
                              <SelectItem value="retail">Retail</SelectItem>
                              <SelectItem value="services">Services</SelectItem>
                              <SelectItem value="technology">Technology</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="template-description">Description</Label>
                        <Textarea
                          id="template-description"
                          value={newTemplate.description}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Template description..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="preview-url">Preview Image URL</Label>
                        <Input
                          id="preview-url"
                          value={newTemplate.preview_url}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, preview_url: e.target.value }))}
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="template-data">Template Data (JSON)</Label>
                        <Textarea
                          id="template-data"
                          value={newTemplate.template_data}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, template_data: e.target.value }))}
                          placeholder='{"sections": ["hero", "services"], "layout": "professional"}'
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label htmlFor="color-schemes">Color Schemes (JSON)</Label>
                        <Textarea
                          id="color-schemes"
                          value={newTemplate.color_schemes}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, color_schemes: e.target.value }))}
                          placeholder='[{"primary": "#3B82F6", "secondary": "#1E40AF", "accent": "#60A5FA"}]'
                          rows={3}
                        />
                      </div>
                      <Button
                        onClick={() => {
                          try {
                            const templateData = {
                              ...newTemplate,
                              template_data: JSON.parse(newTemplate.template_data),
                              color_schemes: JSON.parse(newTemplate.color_schemes)
                            };
                            createTemplateMutation.mutate(templateData);
                          } catch (error) {
                            toast({
                              title: "Invalid JSON",
                              description: "Please check your JSON formatting.",
                              variant: "destructive"
                            });
                          }
                        }}
                        disabled={createTemplateMutation.isPending}
                        className="w-full bg-brand-primary hover:bg-brand-secondary"
                      >
                        {createTemplateMutation.isPending ? "Creating..." : "Create Template"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates?.map((template: any) => (
                  <Card key={template.id}>
                    <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                      <img
                        src={template.preview_url}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{template.name}</h3>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>
                Configure global platform settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">User Registration</Label>
                  <p className="text-sm text-gray-600">Allow new user registrations</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">AI Content Generation</Label>
                  <p className="text-sm text-gray-600">Enable AI-powered content generation</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Custom Domains</Label>
                  <p className="text-sm text-gray-600">Allow users to connect custom domains</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Analytics Tracking</Label>
                  <p className="text-sm text-gray-600">Enable website analytics and tracking</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-sites">Max Sites per User (Starter Plan)</Label>
                <Input
                  id="max-sites"
                  type="number"
                  defaultValue="1"
                  className="w-32"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai-limit">AI Generations per Month (Starter Plan)</Label>
                <Input
                  id="ai-limit"
                  type="number"
                  defaultValue="10"
                  className="w-32"
                />
              </div>

              <Button className="bg-brand-primary hover:bg-brand-secondary">
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}