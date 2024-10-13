import { ReactNode } from "react";
import { UseFormReturn } from "react-hook-form";
import { Form } from "@/components/ui/form";

interface FormContainerProps {
  form: UseFormReturn<any>;
  onSubmit: (data: any) => Promise<void>;
  children: ReactNode;
}

export function FormContainer({
  form,
  onSubmit,
  children,
}: FormContainerProps) {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto w-3/4 space-y-2 bg-white p-8 rounded-lg shadow-lg border border-gray-300"
      >
        {children}
      </form>
    </Form>
  );
}
