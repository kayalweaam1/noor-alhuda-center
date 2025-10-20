import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import { parseCSV } from "@/lib/export";

interface ImportStudentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function ImportStudentsModal({ open, onOpenChange, onSuccess }: ImportStudentsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const createStudent = trpc.students.createWithUser.useMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file type
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error("يرجى رفع ملف CSV فقط");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("يرجى اختيار ملف");
      return;
    }

    setImporting(true);

    try {
      const data = await parseCSV(file);
      
      if (data.length === 0) {
        toast.error("الملف فارغ");
        setImporting(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      // Import each student
      for (const row of data) {
        try {
          await createStudent.mutateAsync({
            name: row["الاسم"] || row["name"] || "",
            phone: row["رقم الهاتف"] || row["phone"] || "",
            password: row["كلمة المرور"] || row["password"] || "123456",
            teacherId: row["معرف المربي"] || row["teacherId"] || "",
            grade: row["الصف"] || row["grade"] || undefined,
          });
          successCount++;
        } catch (error) {
          console.error("Error importing student:", error);
          errorCount++;
        }
      }

      toast.success(`تم استيراد ${successCount} طالب بنجاح${errorCount > 0 ? ` (${errorCount} فشل)` : ""}`);
      
      setFile(null);
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error("فشل في استيراد الملف: " + error.message);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `الاسم,رقم الهاتف,كلمة المرور,معرف المربي,الصف
محمد أحمد,+972501234567,123456,teacher_123,الصف الأول
فاطمة علي,+972509876543,123456,teacher_123,الصف الثاني`;

    const blob = new Blob(["\ufeff" + template], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", "students_template.csv");
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>استيراد طلاب من ملف</DialogTitle>
          <DialogDescription>
            قم برفع ملف CSV يحتوي على بيانات الطلاب
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Download template button */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileSpreadsheet className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 mb-1">تحميل النموذج</h4>
                <p className="text-sm text-blue-700 mb-2">
                  قم بتحميل ملف النموذج وملء بيانات الطلاب
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadTemplate}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Download className="h-4 w-4 mr-2" />
                  تحميل النموذج
                </Button>
              </div>
            </div>
          </div>

          {/* File upload */}
          <div className="space-y-2">
            <Label htmlFor="file">رفع ملف CSV</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file"
                className="cursor-pointer text-sm text-gray-600 hover:text-emerald-600"
              >
                {file ? (
                  <span className="text-emerald-600 font-medium">{file.name}</span>
                ) : (
                  <span>اضغط لاختيار ملف CSV</span>
                )}
              </label>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
            <h4 className="font-medium mb-2">تعليمات:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>يجب أن يكون الملف بصيغة CSV</li>
              <li>الأعمدة المطلوبة: الاسم، رقم الهاتف، كلمة المرور، معرف المربي</li>
              <li>كلمة المرور الافتراضية: 123456</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFile(null);
                onOpenChange(false);
              }}
              disabled={importing}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleImport}
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={!file || importing}
            >
              {importing ? "جاري الاستيراد..." : "استيراد الطلاب"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

