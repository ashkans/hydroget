"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import NProgress from "nprogress"; // Import nprogress
import "nprogress/nprogress.css"; // Import the CSS for progress bar

import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ParameterInputs, ParameterSchema } from "./ParametersInput";
import { ResponseDisplay } from "./ResponseDisplay";
import { FileUploadField } from "./FileUploadField";
import { FormContainer } from "./FormContainer";
import DownloadButton from "./DownloadButton"; // Import the new DownloadButton component

const FormSchema = z
  .object({
    catg: z.instanceof(File).optional(),
    storms: z.array(z.instanceof(File)).optional(),
  })
  .merge(ParameterSchema);

export function KcCalibrationMain() {
  const [responseData, setResponseData] = useState<string | null>(null);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [rawResponseData, setRawResponseData] = useState<any>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      kc: 1,
      m: 0.8,
      initialLoss: 5,
      continuousLoss: 0.5,
    },
  });

  useEffect(() => {
    const hasCatgFile = !!form.watch("catg");
    const hasStormFiles = (form.watch("storms") || []).length > 0;

    setIsSubmitEnabled(hasCatgFile || hasStormFiles);
  }, [form.watch("catg"), form.watch("storms")]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (taskId) {
      NProgress.start(); // Start the progress bar when the task begins
      intervalId = setInterval(checkCalibrationStatus, 5000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      NProgress.done(); // Ensure the progress bar is completed on unmount
    };
  }, [taskId]);

  async function checkCalibrationStatus() {
    try {
      const response = await axios.get(
        `/api/py/get_calibration_status/${taskId}`
      );
      console.log("Calibration status response:", response.data);

      const { result } = response.data;

      // Increment the progress bar
      NProgress.inc(0.1); // Increment by 10% each time

      if (result.status === "completed") {
        // console.log("Completed result data:", result);

        // Check if rorb_kc_qmax_mapping exists before stringifying
        const mappingData = result?.rorb_kc_qmax_mapping
          ? JSON.stringify(result.rorb_kc_qmax_mapping, null, 2)
          : JSON.stringify(result, null, 2);

        setResponseData(mappingData);
        setTaskId(null);
        setIsLoading(false);
        toast({
          title: "Success",
          description: "Calibration completed successfully",
          duration: 3000,
        });
        NProgress.done(); // Complete the progress bar
      } else if (result.status === "error") {
        setTaskId(null);
        setIsLoading(false);
        toast({
          title: "Error",
          description: result.message || "Calibration failed",
          variant: "destructive",
          duration: 3000,
        });
        NProgress.done(); // Complete the progress bar
      } else if (result.status === "pending") {
        // Task is still running, do nothing and wait for the next interval
        console.log("Calibration task is still pending");
      }
    } catch (error) {
      console.error("Error checking calibration status:", error);
      setTaskId(null);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to check calibration status",
        variant: "destructive",
        duration: 3000,
      });
      NProgress.done(); // Complete the progress bar on error
    }
  }

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsSubmitEnabled(false);
    setIsLoading(true);
    const formData = new FormData();
    if (data.catg) {
      formData.append("catg", data.catg);
    }
    if (data.storms && data.storms.length > 0) {
      data.storms.forEach((file) => {
        formData.append(`storms`, file);
      });
    }

    formData.append("kc", data.kc.toString());
    formData.append("m", data.m.toString());
    formData.append("initialLoss", data.initialLoss.toString());
    formData.append("continuousLoss", data.continuousLoss.toString());
    NProgress.start(); // Start the progress bar

    try {
      const response = await axios.post("/api/py/start_calibration", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setTaskId(response.data.task_id);
      toast({
        title: "Success",
        description: "Calibration task started",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start calibration task",
        variant: "destructive",
        duration: 3000,
      });
      console.error("Error submitting data:", error);
      setIsLoading(false);
      NProgress.done(); // Complete the progress bar on error
    } finally {
      setIsSubmitEnabled(true);
      // Remove NProgress.done() from here as it's now handled in the checkCalibrationStatus function
    }
  }

  return (
    <div className="w-full space-y-6">
      <FormContainer form={form} onSubmit={onSubmit}>
        <FileUploadField form={form} />
        <ParameterInputs form={form} />
        <Button
          type="submit"
          className="w-full"
          disabled={!isSubmitEnabled || isLoading}
        >
          {isLoading ? "Processing..." : "Submit"}
        </Button>
      </FormContainer>

      {rawResponseData && <DownloadButton rawResponseData={rawResponseData} />}

      <ResponseDisplay responseData={responseData} />
    </div>
  );
}
