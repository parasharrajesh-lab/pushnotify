import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePush } from "@/lib/push-store";

export function BrandView() {
  const currentName = usePush((s) => s.businessName);
  const currentLogo = usePush((s) => s.logo);
  const saveBrand = usePush((s) => s.saveBrand);
  const [name, setName] = useState(currentName);
  const [logo, setLogo] = useState(currentLogo);

  return (
    <form
      className="flex max-w-xl flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void (async () => {
          const error = await saveBrand({ name, logo });
          if (error) toast.error(error);
          else toast.success("Brand updated.");
        })();
      }}
    >
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight">Brand</h1>
        <p className="pt-1 text-sm text-muted-foreground">The logo and name appear on every lock-screen preview for this business.</p>
      </div>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Business name
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Logo link
        <Input value={logo.startsWith("data:") ? "" : logo} onChange={(e) => setLogo(e.target.value)} placeholder="https://" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Or upload
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="text-sm"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            if (file.size > 120_000) {
              toast.error("Logo must be under 120 KB.");
              return;
            }
            const reader = new FileReader();
            reader.onload = () => setLogo(typeof reader.result === "string" ? reader.result : "");
            reader.readAsDataURL(file);
          }}
        />
      </label>
      {logo ? <img src={logo} alt="" className="size-16 rounded-sm border border-border object-cover" /> : null}
      <Button type="submit">Save brand</Button>
    </form>
  );
}
