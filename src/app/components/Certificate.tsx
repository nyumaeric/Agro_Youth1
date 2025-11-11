"use client";
import { Certificate as CertificateType } from "@/hooks/useCourses";
import { Award, Download, X } from "lucide-react";
import { useRef, useState } from "react";
import showToast from "@/utils/showToast";
import { Button } from "@/components/ui/button";

interface CertificateProps {
  certificate: CertificateType;
  onClose: () => void;
  userName?: string;
}

export default function Certificate({ certificate, onClose, userName }: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    const element = certificateRef.current;
    if (!element) return;

    setIsDownloading(true);
    showToast("Generating PDF...", "success");

    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      await new Promise(resolve => setTimeout(resolve, 200));

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const mmWidth = (imgWidth * 25.4) / 96;
      const mmHeight = (imgHeight * 25.4) / 96;

      const pdf = new jsPDF({
        orientation: mmWidth > mmHeight ? "landscape" : "portrait",
        unit: "mm",
        format: [mmWidth, mmHeight],
      });

      pdf.addImage(imgData, "PNG", 0, 0, mmWidth, mmHeight, undefined, "FAST");

      const fileName = `${certificate.courseTitle.replace(/[^a-z0-9]/gi, "_")}_Certificate.pdf`;
      pdf.save(fileName);

      showToast("Certificate downloaded successfully!", "success");
    } catch (error) {
      console.error("Download error:", error);
      showToast("Failed to download certificate. Please try again.", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-7xl bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-green-600" />
            Your Certificate
          </h2>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className={`w-4 h-4 ${isDownloading ? "animate-bounce" : ""}`} />
              {isDownloading ? "Generating..." : "Download PDF"}
            </Button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-8">
          <div
            ref={certificateRef}
            style={{ backgroundColor: "#ffffff", minWidth: "1200px" }}
            className="w-full border-8 rounded-lg shadow-lg"
            data-certificate="true"
          >
            <style jsx>{`
              [data-certificate="true"] {
                border-color: #16a34a !important;
              }
              [data-certificate="true"] .corner-border {
                border-color: #eab308 !important;
              }
              [data-certificate="true"] .gradient-line {
                background: linear-gradient(to right, transparent, #eab308, transparent) !important;
              }
            `}</style>
              <div className="text-center space-y-8 py-8">
                <div className="space-y-2">
                  <div className="flex justify-center mb-4">
                    <Award className="w-20 h-20" style={{ color: "#16a34a" }} />
                  </div>
                  <h1 className="text-5xl font-bold tracking-wide" style={{ color: "#111827" }}>
                    CERTIFICATE
                  </h1>
                  <p className="text-xl" style={{ color: "#4b5563" }}>OF COMPLETION</p>
                </div>

                <div className="flex items-center justify-center">
                  <div className="h-px w-24 gradient-line"></div>
                </div>

                <div className="space-y-4">
                  <p className="text-lg" style={{ color: "#4b5563" }}>This is to certify that</p>
                  <p className="text-4xl font-bold" style={{ color: "#16a34a" }}>{userName}</p>
                  <p className="text-lg" style={{ color: "#4b5563" }}>has successfully completed</p>
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-bold" style={{ color: "#111827" }}>
                    {certificate.courseTitle}
                  </h2>
                  <div className="flex items-center justify-center gap-4 text-sm mt-4">
                    {certificate.courseLevel && (
                      <span className="px-3 py-1 rounded-full" style={{ backgroundColor: "#f3f4f6", color: "#4b5563" }}>
                        {certificate.courseLevel}
                      </span>
                    )}
                    {certificate.courseCategory && (
                      <span className="px-3 py-1 rounded-full" style={{ backgroundColor: "#f3f4f6", color: "#4b5563" }}>
                        {certificate.courseCategory}
                      </span>
                    )}
                  </div>
                </div>

                <div className="max-w-2xl mx-auto">
                  <p className="leading-relaxed" style={{ color: "#374151" }}>
                    {certificate.completionMessage}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 mt-8" style={{ borderTop: "2px solid #e5e7eb" }}>
                  <div>
                    <p className="text-sm mb-1" style={{ color: "#6b7280" }}>Date of Completion</p>
                    <p className="font-semibold" style={{ color: "#111827" }}>
                      {formatDate(certificate.completedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm mb-1" style={{ color: "#6b7280" }}>Course Instructor</p>
                    <p className="font-semibold" style={{ color: "#111827" }}>
                      {certificate.courseInstructorFullName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm mb-1" style={{ color: "#6b7280" }}>Course Duration</p>
                    <p className="font-semibold" style={{ color: "#111827" }}>
                      {certificate.timeToComplete}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}