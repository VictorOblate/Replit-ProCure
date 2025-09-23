import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Boxes, ShoppingCart, Users, TrendingUp, CheckCircle } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(2, "Full name is required"),
  role: z.enum(['GENERAL_USER', 'HOD', 'PROCUREMENT_MANAGER', 'FINANCE_OFFICER']),
  departmentId: z.string().min(1, "Department is required"),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  const { data: departments = [] } = useQuery({
    queryKey: ["/api/departments"],
  });

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      fullName: "",
      role: "GENERAL_USER",
      departmentId: "",
    },
  });

  const onLogin = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  if (user) return null;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Boxes className="text-primary-foreground text-lg" />
            </div>
            <span className="text-2xl font-semibold text-foreground">ProCure</span>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome back</CardTitle>
                  <CardDescription>
                    Sign in to your account to continue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-login-username" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} data-testid="input-login-password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                        data-testid="button-login"
                      >
                        {loginMutation.isPending ? "Signing in..." : "Sign in"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create account</CardTitle>
                  <CardDescription>
                    Join the procurement system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-register-username" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} data-testid="input-register-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-register-fullname" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} data-testid="input-register-password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-register-role">
                                  <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="GENERAL_USER">General User</SelectItem>
                                <SelectItem value="HOD">Head of Department</SelectItem>
                                <SelectItem value="PROCUREMENT_MANAGER">Procurement Manager</SelectItem>
                                <SelectItem value="FINANCE_OFFICER">Finance Officer</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="departmentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-register-department">
                                  <SelectValue placeholder="Select your department" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {departments.map((dept: any) => (
                                  <SelectItem key={dept.id} value={dept.id}>
                                    {dept.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                        data-testid="button-register"
                      >
                        {registerMutation.isPending ? "Creating account..." : "Create account"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="flex-1 bg-primary text-primary-foreground flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-6">
          <h1 className="text-4xl font-bold">
            Streamline Your Procurement Process
          </h1>
          <p className="text-lg opacity-90">
            Manage inventory, track requests, and automate approvals with our comprehensive procurement system.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary-foreground/20 rounded-lg flex items-center justify-center mx-auto">
                <ShoppingCart className="text-2xl" />
              </div>
              <h3 className="font-semibold">Smart Procurement</h3>
              <p className="text-sm opacity-80">Automated workflows and approvals</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary-foreground/20 rounded-lg flex items-center justify-center mx-auto">
                <Users className="text-2xl" />
              </div>
              <h3 className="font-semibold">Multi-Department</h3>
              <p className="text-sm opacity-80">Cross-department collaboration</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary-foreground/20 rounded-lg flex items-center justify-center mx-auto">
                <TrendingUp className="text-2xl" />
              </div>
              <h3 className="font-semibold">Real-time Analytics</h3>
              <p className="text-sm opacity-80">Track performance and trends</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary-foreground/20 rounded-lg flex items-center justify-center mx-auto">
                <CheckCircle className="text-2xl" />
              </div>
              <h3 className="font-semibold">Audit Trail</h3>
              <p className="text-sm opacity-80">Complete compliance tracking</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
