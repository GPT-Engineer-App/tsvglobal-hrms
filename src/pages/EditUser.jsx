import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import Sidebar from '@/components/Sidebar';
import { useUser, useUpdateUser } from '@/hooks/useUsers';
import { useToast } from "@/components/ui/use-toast";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: user, isLoading, isError } = useUser(id);
  const updateUser = useUpdateUser();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: '',
    status: '',
    password: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        password: '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser.mutateAsync({ id, ...formData });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      navigate('/user-management');
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading user data</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">Edit User</h1>
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" name="username" value={formData.username} onChange={handleChange} required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select id="role" name="role" value={formData.role} onChange={handleChange} required>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select id="status" name="status" value={formData.status} onChange={handleChange} required>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="password">New Password (leave blank to keep current)</Label>
                    <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} />
                  </div>
                  <Button type="submit" disabled={updateUser.isLoading}>
                    {updateUser.isLoading ? 'Updating...' : 'Update User'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditUser;
