import { KcCalibrationMain } from "@/components/KcCalibration/Main";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

interface CustomCardProps {
  title: string;
  description: string;
  content: React.ReactNode;
  footer?: React.ReactNode;
  href: string;
}

function CustomCard({
  title,
  description,
  content,
  footer,
  href,
}: CustomCardProps) {
  return (
    <Link href={href}>
      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{content}</CardContent>
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
    </Link>
  );
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CustomCard
          title="Kc Calibration"
          description="A tool to analisys the effect of kc on the peakflow using rorb standard ensemble storms and catg file."
          content={<p></p>}
          href="/kcCalibration"
        />
      </div>
    </main>
  );
}
