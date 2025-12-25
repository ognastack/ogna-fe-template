"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/api/OgnaContext";
import { useCallback, useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileObj } from "@/types/storage";
import { toast } from "sonner";

import { IconDownload, IconFile } from "@tabler/icons-react";

import { Card, CardFooter, CardHeader } from "@/components/ui/card";

interface UploadFileProps {
  onCreate: () => void;
  bucketName: string;
}

const UploadFile = ({ onCreate, bucketName }: UploadFileProps) => {
  // 1. Change state to hold a File object instead of a string
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const { client } = useAuth();

  const handleUploadFile = async () => {
    // 2. Validation check for the file object
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);

    // 3. Pass the File object to your uploadFile method
    const { data, error } = await client.storage.uploadFile(
      bucketName,
      selectedFile
    );

    if (error) {
      toast.error(error.msg || "Something went wrong");
    } else if (data) {
      toast.success("File uploaded successfully");
      setOpen(false);
      setSelectedFile(null);
      onCreate();
    } else {
      toast.error("Something went wrong");
    }

    setIsUploading(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">Upload File</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">New File</h4>
            <p className="text-muted-foreground text-sm">Upload new file</p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="fileInput">Select file</Label>
              <Input
                id="fileInput"
                type="file"
                // 4. Capture the file from e.target.files
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                // Do NOT use 'value' here
                className="col-span-2 h-auto py-1"
              />
            </div>
            <div className="flex flex-col items-end">
              <Button
                onClick={handleUploadFile}
                disabled={isUploading || !selectedFile}
              >
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const ViewBucketPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [bucketObjs, setBucketObjs] = useState<FileObj[]>([]);
  const { client } = useAuth();

  const fetchObjects = useCallback(async () => {
    if (id) {
      try {
        const { data, error } = await client.storage.listFiles(id);
        if (error) throw error;
        setBucketObjs(data as FileObj[]);
      } catch (err) {
        console.error("Error fetching buckets:", err);
      }
    }
  }, [id, client]);

  const handleDownload = async (fileName: string) => {
    // 1. Call your SDK method
    const { data: blob, error } = await client.storage.downloadFile(
      id,
      fileName
    );

    if (error) {
      toast.error(error.msg || "Failed to download file");
      return;
    }

    if (blob) {
      // 2. Create a temporary URL for the binary data
      const url = window.URL.createObjectURL(blob);

      // 3. Create a hidden anchor element
      const link = document.createElement("a");
      link.href = url;

      // 4. Tell the browser what the file name should be
      link.setAttribute("download", fileName);

      // 5. Trigger the download by "clicking" the link programmatically
      document.body.appendChild(link);
      link.click();

      // 6. Cleanup: remove the link and revoke the URL to save memory
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`${fileName} downloaded!`);
    }
  };

  useEffect(() => {
    if (id) {
      fetchObjects();
    }
  }, [id, fetchObjects]);

  if (!id) {
    return;
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
              <div className="flex flex-col gap-4 items-end">
                <UploadFile onCreate={fetchObjects} bucketName={id} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {bucketObjs.map((fobj) => [
                  <Card key={`bucket-card-${fobj.id}`} className="">
                    <CardHeader>
                      <div className="flex gap-2 items-center">
                        <IconFile />
                        {fobj.name}
                      </div>
                    </CardHeader>
                    <CardFooter className="flex flex-col gap-2 items-end">
                      <IconDownload
                        onClick={() => {
                          handleDownload(fobj.name);
                        }}
                      />
                    </CardFooter>
                  </Card>,
                ])}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ViewBucketPage;
