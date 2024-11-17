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
import { useAuth } from "@clerk/nextjs";

// Use custom file validation since File is not available during SSR
const isFile = (value: any): value is File => {
  return typeof window !== "undefined" && value instanceof File;
};

const FormSchema = z
  .object({
    catg: z.custom<File>(isFile).optional(),
    storms: z.array(z.custom<File>(isFile)).optional(),
  })
  .merge(ParameterSchema);

const MAX_SIMULATIONS = 300; // Make this configurable by moving it to a constant

export function KcCalibrationMain() {
  const { getToken } = useAuth();
  const [responseData, setResponseData] = useState<string | null>(null);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [rawResponseData, setRawResponseData] = useState<any>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalSimulations, setTotalSimulations] = useState(0);
  const [kcValues, setKcValues] = useState<number[]>([]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      kcMin: 0.8,
      kcMax: 2,
      kcStep: 0.2,
      m: 0.8,
      initialLoss: 5,
      continuousLoss: 0.5,
    },
  });

  useEffect(() => {
    const hasCatgFile = !!form.watch("catg");
    const hasStormFiles = (form.watch("storms") || []).length > 0;
    const stormFiles = form.watch("storms") || [];
    const kcMin = form.watch("kcMin");
    const kcMax = form.watch("kcMax");
    const kcStep = form.watch("kcStep");

    // Check if kcMin is greater than or equal to kcMax
    if (kcMin >= kcMax) {
      setIsSubmitEnabled(false);
      form.setError("kcMin", {
        message: "Kc Min must be less than Kc Max",
      });
      form.setError("kcMax", {
        message: "Kc Max must be greater than Kc Min",
      });
      return;
    } else {
      form.clearErrors("kcMin");
      form.clearErrors("kcMax");
    }

    const numKcValues = Math.ceil((kcMax - kcMin) / kcStep) + 1;
    const calculatedSimulations = numKcValues * stormFiles.length;
    setTotalSimulations(calculatedSimulations);

    // Calculate Kc values
    const kcs: number[] = [];
    for (let kc = kcMin; kc <= kcMax; kc += kcStep) {
      kcs.push(Number(kc.toFixed(3)));
    }
    setKcValues(kcs);

    if (calculatedSimulations > MAX_SIMULATIONS) {
      setIsSubmitEnabled(false);
      console.log("Too many simulations", calculatedSimulations);
      toast({
        title: "Warning",
        description: `Too many simulations (${calculatedSimulations}). Maximum allowed is ${MAX_SIMULATIONS}. Please reduce the number of storm files or adjust Kc parameters.`,
        variant: "destructive",
        duration: 5000,
      });
    } else {
      setIsSubmitEnabled(hasCatgFile && hasStormFiles);
    }
  }, [
    form.watch("catg"),
    form.watch("storms"),
    form.watch("kcMin"),
    form.watch("kcMax"),
    form.watch("kcStep"),
  ]);

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
    console.log("Checking calibration status");
    try {
      const response = await axios.get(
        `/api/py/get_calibration_status/${taskId}`
      );

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
        console.log("Calibration completed", mappingData);
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
    // Check if kcMin is greater than or equal to kcMax before submitting
    if (data.kcMin >= data.kcMax) {
      toast({
        title: "Error",
        description: "Kc Min must be smaller than Kc Max",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    // set responseData to null
    setResponseData(null);
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

    formData.append("kcMin", data.kcMin.toString());
    formData.append("kcMax", data.kcMax.toString());
    formData.append("kcStep", data.kcStep.toString());
    formData.append("m", data.m.toString());
    formData.append("initialLoss", data.initialLoss.toString());
    formData.append("continuousLoss", data.continuousLoss.toString());

    NProgress.start(); // Start the progress bar
    try {
      console.log("Starting calibration task", formData);
      const token = await getToken();

      const response = await axios.post("/api/py/start_calibration", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Calibration task started with response:", response.data);

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
        {totalSimulations > MAX_SIMULATIONS && (
          <p className="text-sm text-red-500 mt-2">
            Total simulations ({totalSimulations}) exceeds maximum limit of{" "}
            {MAX_SIMULATIONS}. Please reduce storm files or adjust Kc
            parameters.
          </p>
        )}
        {totalSimulations <= MAX_SIMULATIONS && totalSimulations > 0 && (
          <p className="text-sm text-black mt-2">
            Number of simulations: {totalSimulations} (max {MAX_SIMULATIONS})
          </p>
        )}
        {kcValues.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium">Kc values to be tested:</p>
            <p className="text-sm text-gray-600">{kcValues.join(", ")}</p>
          </div>
        )}
      </FormContainer>

      <ResponseDisplay responseData={responseData} />
      {responseData && <DownloadButton rawResponseData={responseData} />}
    </div>
  );
}
