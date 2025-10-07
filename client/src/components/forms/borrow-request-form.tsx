import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const borrowRequestSchema = z.object({
  itemId: z.string().min(1, "Item is required"),
  owningDepartmentId: z.string().min(1, "Owning department is required"),
  quantityRequested: z.coerce.number().min(1, "Quantity must be at least 1"),
  justification: z.string().min(10, "Justification must be at least 10 characters"),
  requiredDate: z.date()
});

type BorrowRequestData = z.infer<typeof borrowRequestSchema>;

interface BorrowRequestFormProps {
  onSuccess: () => void;
}

export function BorrowRequestForm({ onSuccess }: BorrowRequestFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [] } = useQuery<Array<{id: string; code: string; name: string}>>({
    queryKey: ["/api/items"],
  });

  const { data: departments = [] } = useQuery<Array<{id: string; name: string}>>({
    queryKey: ["/api/departments"],
  });

  const { data: stockData = [] } = useQuery<Array<{
    id: string;
    itemId: string;
    departmentName: string;
    quantityAvailable: number;
    unit: string;
  }>>({
    queryKey: ["/api/stock"],
  });

  const form = useForm<BorrowRequestData>({
    resolver: zodResolver(borrowRequestSchema),
    defaultValues: {
      itemId: "",
      owningDepartmentId: "",
      quantityRequested: 1,
      justification: "",
      requiredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week from now
    },
  });

  const createBorrowRequestMutation = useMutation({
    mutationFn: async (data: BorrowRequestData) => {
      const requestData = {
        ...data,
        requiredDate: data.requiredDate.toISOString()
      };
      console.log("Request Data: ", requestData);
      const response = await apiRequest("POST", "/api/borrow-requests", requestData);
      return response.json();
    },


    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/borrow-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({ title: "Borrow request submitted successfully" });
      onSuccess();
    },
    onError: (error) => {
      console.log("Here is the error: ", error)
      toast({ 
        title: "Failed to submit borrow request. Joh", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const selectedItemId = form.watch("itemId");
  const availableStock = stockData.filter(stock => stock.itemId === selectedItemId);

  const onSubmit = (data: BorrowRequestData) => {
    createBorrowRequestMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="itemId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-borrow-item">
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {items.map((item: any) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.code} - {item.name}
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
          name="owningDepartmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Owning Department</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-owning-department">
                    <SelectValue placeholder="Select department that owns this item" />
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

        {availableStock.length > 0 && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">Available Stock:</p>
            {availableStock.map((stock) => (
              <p key={stock.id} className="text-sm text-muted-foreground">
                {stock.departmentName}: {stock.quantityAvailable} {stock.unit} available
              </p>
            ))}
          </div>
        )}

        <FormField
          control={form.control}
          name="quantityRequested"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity Requested</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  data-testid="input-quantity"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="justification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Justification</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Explain why you need these items..."
                  {...field}
                  data-testid="textarea-justification"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requiredDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Required Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      data-testid="button-required-date"
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onSuccess} data-testid="button-cancel">
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createBorrowRequestMutation.isPending}
            data-testid="button-submit-borrow-request"
          >
            {createBorrowRequestMutation.isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
