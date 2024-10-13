import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DownloadButtonProps {
  rawResponseData: any; // Accept raw response data as a prop
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ rawResponseData }) => {
  const handleDownload = () => {
    if (rawResponseData) {
      const blob = new Blob([JSON.stringify(rawResponseData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "calibration_results.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex justify-end mb-4">
      <Button onClick={handleDownload} className="flex items-center gap-2">
        <Download size={16} />
        Download Results
      </Button>
    </div>
  );
};

export default DownloadButton;
