import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DownloadButtonProps {
  rawResponseData: any; // Accept raw response data as a prop
}

// Function to convert JSON to CSV format
const convertJsonToCsv = (jsonData: any) => {
  const headers = [
    "Hydro ID",
    "Peak",
    "Critical Duration",
    "Critical Pattern",
    "KC",
  ];
  let csvRows: string[] = [];

  // Add headers to the CSV rows
  csvRows.push(headers.join("\t"));
  // Convert JSON data into CSV format
  Object.keys(jsonData).forEach((hydroId) => {
    const data = jsonData[hydroId];
    const { peak, critical_duration, critical_pattern, kc } = data;
    for (let i = 0; i < peak.length; i++) {
      csvRows.push(
        [
          hydroId,
          peak[i],
          critical_duration[i],
          critical_pattern[i],
          kc[i],
        ].join("\t")
      );
    }
  });

  return csvRows.join("\n");
};

const DownloadButton: React.FC<DownloadButtonProps> = ({ rawResponseData }) => {
  const handleDownload = () => {
    if (rawResponseData) {
      // Convert JSON to CSV

      const jsonData = JSON.parse(rawResponseData);
      const csvData = convertJsonToCsv(jsonData);
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "calibration_results.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex justify-center">
      <Button onClick={handleDownload} className="flex items-center gap-2">
        <Download size={16} />
        Download Results
      </Button>
    </div>
  );
};

export default DownloadButton;
