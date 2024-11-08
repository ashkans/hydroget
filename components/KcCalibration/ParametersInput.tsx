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
  kcMin: z.number().default(0.8),
  kcMax: z.number().default(2),
  kcStep: z.number().default(0.2),
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
    <div className="grid grid-cols-3 gap-4">
      <FormField
        control={form.control}
        name="kcMin"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kc Min</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                className="w-full"
                step={0.1}
                min={0.1}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="kcMax"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kc Max</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                className="w-full"
                step={0.1}
                min={0.1}
              />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="kcStep"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kc Step</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                className="w-full"
                step={0.05}
                min={0.01}
              />
            </FormControl>

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
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
