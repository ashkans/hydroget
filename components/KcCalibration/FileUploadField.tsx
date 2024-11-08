import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface FileUploadFieldProps {
  form: UseFormReturn<any>;
}

export function FileUploadField({ form }: FileUploadFieldProps) {
  const [catgFileName, setCatgFileName] = useState<string | null>(null);
  const [stormsFileName, setStormsFileName] = useState<string | null>(null);

  return (
    <>
      <FormField
        control={form.control}
        name="catg"
        render={({ field: { onChange, value, ...rest } }) => (
          <>
            <FormItem>
              <FormLabel>Upload catchment file</FormLabel>
              <FormControl>
                <Input
                  id="catg"
                  type="file"
                  accept=".catg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onChange(file);
                      setCatgFileName(file.name);
                    }
                  }}
                  {...rest}
                />
              </FormControl>
              <FormDescription>
                {catgFileName
                  ? `Selected file: ${catgFileName}`
                  : "Upload a catg file."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          </>
        )}
      />
      <FormField
        control={form.control}
        name="storms"
        render={({ field: { onChange, value, ...rest } }) => (
          <>
            <FormItem>
              <FormLabel>Upload storm files</FormLabel>
              <FormControl>
                <Input
                  id="file_storm"
                  type="file"
                  accept=".stm"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      onChange(files); // Pass the array of files to onChange
                      const fileNames = files
                        .map((file) => file.name)
                        .join(", ");
                      setStormsFileName(fileNames); // Join the file names as a string
                    }
                  }}
                  multiple
                  {...rest}
                />
              </FormControl>
              <FormDescription>
                {stormsFileName
                  ? `Selected file: ${stormsFileName}`
                  : "Upload storm files produced by RORB ensemble."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          </>
        )}
      />
    </>
  );
}
