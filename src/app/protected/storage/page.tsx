"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/api/OgnaContext";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Bucket } from "@/types/storage";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { IconBucket } from "@tabler/icons-react";
import { Card, CardHeader } from "@/components/ui/card";

type CreateBucketProps = {
  onCreate: () => void;
};

const CreateBucket = ({ onCreate }: CreateBucketProps) => {
  const [bucketName, setBucketName] = useState("");
  const [open, setOpen] = useState(false);
  const { client } = useAuth();
  const handleCreateBucket = async () => {
    if (!bucketName) {
      toast.error("Please enter a bucket name");
    } else {
      const { data, error } = await client.storage.createBucket(bucketName);
      if (error) {
        toast.error(error.msg || "Somethign went wrong");
      } else if (data) {
        toast.message("Bucket was created");
      } else {
        toast.error("Somethign went wrong");
      }

      setOpen(false);
      onCreate();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">New Bucket</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">New Bucket</h4>
            <p className="text-muted-foreground text-sm">Create new Bucket</p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="bucketName">Name</Label>
              <Input
                id="bucketName"
                value={bucketName}
                onChange={(e) => setBucketName(e.target.value)}
                placeholder="my-new-bucket"
                className="col-span-2 h-8"
              />
            </div>
            <div className="flex flex-col items-end">
              <Button onClick={handleCreateBucket}>Create</Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const StoragePage = () => {
  const { client } = useAuth();
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const router = useRouter();

  const fetchBuckets = useCallback(async () => {
    try {
      const { data, error } = await client.storage.listBuckets();
      if (error) throw error;
      setBuckets(data as Bucket[]);
    } catch (err) {
      console.error("Error fetching buckets:", err);
    }
  }, [client]);

  useEffect(() => {
    fetchBuckets();
  }, [fetchBuckets]);

  const handleNavigate = (bucketId: string) => {
    router.push(`/protected/storage/bucket/${bucketId}`);
  };

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
                <CreateBucket onCreate={fetchBuckets} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {buckets.map((bucket) => [
                  <Card
                    key={`bucket-card-${bucket.id}`}
                    onClick={() => handleNavigate(bucket.name)}
                    className=""
                  >
                    <CardHeader>
                      <div className="flex gap-2 items-center">
                        <IconBucket />
                        {bucket.name}
                      </div>
                    </CardHeader>
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

export default StoragePage;
