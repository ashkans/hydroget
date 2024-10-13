import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export const ParameterSchema = z.object({
  kc: z.number().default(1),
  m: z.number().default(0.8),
  initialLoss: z.number().default(5),
  continuousLoss: z.number().default(0.5),
});

type ParameterFormValues = z.infer<typeof ParameterSchema>;

interface ParameterInputsProps {
  form: UseFormReturn<ParameterFormValues>;
}

export function ParameterInputs({ form }: ParameterInputsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="kc"
        render={({ field }) => (
          <FormItem>
            <FormLabel>kc</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                className="w-full"
              />
            </FormControl>
            <FormDescription className="text-xs">Default: 1</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="m"
        render={({ field }) => (
          <FormItem>
            <FormLabel>m</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                className="w-full"
              />
            </FormControl>
            <FormDescription className="text-xs">Default: 0.8</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="initialLoss"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Initial Loss</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                className="w-full"
              />
            </FormControl>
            <FormDescription className="text-xs">Default: 5</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="continuousLoss"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Continuous Loss</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                className="w-full"
              />
            </FormControl>
            <FormDescription className="text-xs">Default: 0.5</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
