import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const vendorSchema = z.object({
  name: z.string().min(1, "Vendor name is required"),
  registrationNumber: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  contactPerson: z.string().min(1, "Contact person is required"),
  categories: z.string().min(1, "Categories are required"),
});

type VendorData = z.infer<typeof vendorSchema>;

interface VendorFormProps {
  onSuccess: () => void;
}

export function VendorForm({ onSuccess }: VendorFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<VendorData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: "",
      registrationNumber: "",
      email: "",
      phone: "",
      address: "",
      contactPerson: "",
      categories: "",
    },
  });

  const createVendorMutation = useMutation({
    mutationFn: async (data: VendorData) => {
      // Convert categories string to array
      const vendorData = {
        ...data,
        categories: data.categories.split(',').map(cat => cat.trim()).filter(Boolean),
      };
      const response = await apiRequest("POST", "/api/vendors", vendorData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      toast({ title: "Vendor created successfully" });
      onSuccess();
    },
    onError: (error) => {
      toast({ 
        title: "Failed to create vendor", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: VendorData) => {
    createVendorMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter vendor name"
                    {...field}
                    data-testid="input-vendor-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="registrationNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registration Number</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter registration number"
                    {...field}
                    data-testid="input-registration-number"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    placeholder="vendor@example.com"
                    {...field}
                    data-testid="input-vendor-email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter phone number"
                    {...field}
                    data-testid="input-vendor-phone"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="contactPerson"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Person</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter contact person name"
                  {...field}
                  data-testid="input-contact-person"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter vendor address"
                  {...field}
                  data-testid="textarea-vendor-address"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categories</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter categories (comma-separated)"
                  {...field}
                  data-testid="input-vendor-categories"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onSuccess} data-testid="button-cancel-vendor">
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createVendorMutation.isPending}
            data-testid="button-submit-vendor"
          >
            {createVendorMutation.isPending ? "Creating..." : "Create Vendor"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
