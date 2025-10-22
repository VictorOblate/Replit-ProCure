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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const purchaseRequisitionSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  estimatedCost: z.coerce.number().min(0.01, "Estimated cost must be greater than 0")
    .transform(val => val.toFixed(2)), // Format as string with 2 decimal places
  justification: z.string().min(10, "Justification must be at least 10 characters"),
  requiredDate: z.date(),
});

type PurchaseRequisitionData = z.infer<typeof purchaseRequisitionSchema>;

interface PurchaseRequisitionFormProps {
  onSuccess: () => void;
}

export function PurchaseRequisitionForm({ onSuccess }: PurchaseRequisitionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PurchaseRequisitionData>({
    resolver: zodResolver(purchaseRequisitionSchema),
    defaultValues: {
      itemName: "",
      description: "",
      quantity: 1,
      estimatedCost: "",
      justification: "",
      requiredDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default to 2 weeks from now
    },
  });

  const createPurchaseRequisitionMutation = useMutation({
    mutationFn: async (data: PurchaseRequisitionData) => {
      const requestData = {
        ...data,
        requiredDate: data.requiredDate.toISOString()
      };
      const response = await apiRequest("POST", "/api/purchase-requisitions", requestData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-requisitions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({ title: "Purchase requisition submitted successfully" });
      onSuccess();
    },
    onError: (error) => {
      console.log("Here is the error: ", error)
      toast({ 
        title: "Failed to submit purchase requisition", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: PurchaseRequisitionData) => {
    createPurchaseRequisitionMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="itemName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter item name"
                  {...field}
                  data-testid="input-item-name"
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Detailed description of the item..."
                  {...field}
                  data-testid="textarea-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1"
                    {...field}
                    onChange={e => field.onChange(e.target.value)}
                    data-testid="input-purchase-quantity"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estimatedCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Cost (M)</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                    data-testid="input-estimated-cost"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="justification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Justification</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Explain why this purchase is necessary..."
                  {...field}
                  data-testid="textarea-purchase-justification"
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
                      data-testid="button-purchase-required-date"
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
          <Button type="button" variant="outline" onClick={onSuccess} data-testid="button-cancel-purchase">
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createPurchaseRequisitionMutation.isPending}
            data-testid="button-submit-purchase-requisition"
          >
            {createPurchaseRequisitionMutation.isPending ? "Submitting..." : "Submit Requisition"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
